// --- Configuration ---
const DEVICE_COUNT = 5;
const RADIUS = 260;
const CENTER_X = 350;
const CENTER_Y = 350;

// --- State Management ---
const devices = [];
const globalCloudSet = new Set();

class Device {
    constructor(id, ownerName) {
        this.id = id;
        this.ownerName = ownerName
        this.isOnline = true;
        this.localSet = new Set();
        this.outbox = [];

        this.element = this.createDOM();
        this.lineElement = this.createLine();
    }

    createDOM() {
        const angle =
            ((2 * Math.PI) / DEVICE_COUNT) * (this.id - 1) - Math.PI / 2;
        const x = CENTER_X + RADIUS * Math.cos(angle) - 80;
        const y = CENTER_Y + RADIUS * Math.sin(angle) - 100;

        const div = document.createElement("div");
        div.className = "device online";
        div.style.left = `${x}px`;
        div.style.top = `${y}px`;
        div.id = `device-${this.id}`;
        div.innerHTML = `
                    <div class="device-header">
                        <span class="device-title">Device ${this.id} - ${this.ownerName}</span>
                        <label class="toggle">
                            <input type="checkbox" checked onchange="toggleDevice(${this.id}, this.checked)">
                            <span class="slider"></span>
                        </label>
                    </div>
                    <div class="input-area">
                        <input type="text" id="in-${this.id}" placeholder="Add task..." onkeypress="handleEnter(event, ${this.id})">
                        <button onclick="addItem(${this.id})">+</button>
                    </div>
                    <ul id="list-${this.id}"></ul>
                `;
        document.querySelector(".network-container").appendChild(div);
        return div;
    }

    createLine() {
        const line = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );
        const devRect = this.element.getBoundingClientRect();
        // We use fixed calculations based on CENTER_X/Y to ensure lines stay correct regardless of scrolling
        // Recalculating based on initial positions relative to container

        const angle =
            ((2 * Math.PI) / DEVICE_COUNT) * (this.id - 1) - Math.PI / 2;
        const devCenterX = CENTER_X + RADIUS * Math.cos(angle);
        const devCenterY = CENTER_Y + RADIUS * Math.sin(angle);

        line.setAttribute("x1", devCenterX);
        line.setAttribute("y1", devCenterY);
        line.setAttribute("x2", CENTER_X);
        line.setAttribute("y2", CENTER_Y);
        line.classList.add("active");
        document.getElementById("linesLayer").appendChild(line);
        return line;
    }

    add(item) {
        if (!item || this.localSet.has(item)) return;
        this.localSet.add(item);
        this.render();

        if (this.isOnline) {
            this.sendToCloud(item);
        } else {
            this.outbox.push(item);
        }
    }

    receive(item) {
        if (!this.localSet.has(item)) {
            this.localSet.add(item);
            this.render();
        }
    }

    setOnline(status) {
        this.isOnline = status;
        this.element.classList.toggle("online", status);
        this.element.classList.toggle("offline", !status);
        this.lineElement.classList.toggle("active", status);

        if (status) {
            this.outbox.forEach((item) => this.sendToCloud(item));
            this.outbox = [];
            requestCloudSync(this);
        }
    }

    sendToCloud(item) {
        spawnPacket(
            this.element,
            document.getElementById("cloudHub"),
            "upload",
            () => {
                receiveAtCloud(item, this.id);
            }
        );
    }

    render() {
        const ul = document.getElementById(`list-${this.id}`);
        ul.innerHTML = "";
        Array.from(this.localSet)
            .sort()
            .forEach((val) => {
                const li = document.createElement("li");
                li.innerHTML = `${val} <span class="check">✔</span>`;
                ul.appendChild(li);
            });
    }
}

// --- Init ---

ownerNames = ['Sam', 'Gene', 'Gabriel', 'Deji', 'Ben'];
for (let i = 1; i <= DEVICE_COUNT; i++) {
    devices.push(new Device(i, ownerNames[i - 1]));
}

function handleEnter(e, id) {
    if (e.key === "Enter") addItem(id);
}

function addItem(id) {
    const input = document.getElementById(`in-${id}`);
    const val = input.value.trim();
    if (val) {
        devices[id - 1].add(val);
        input.value = "";
    }
}

function toggleDevice(id, status) {
    devices[id - 1].setOnline(status);
}

function receiveAtCloud(item, senderId) {
    if (!globalCloudSet.has(item)) {
        globalCloudSet.add(item);
        devices.forEach((dev) => {
            if (dev.id !== senderId && dev.isOnline) {
                spawnPacket(
                    document.getElementById("cloudHub"),
                    dev.element,
                    "download",
                    () => {
                        dev.receive(item);
                    }
                );
            }
        });
    }
}

function requestCloudSync(device) {
    globalCloudSet.forEach((item) => {
        if (!device.localSet.has(item)) {
            setTimeout(() => {
                spawnPacket(
                    document.getElementById("cloudHub"),
                    device.element,
                    "download",
                    () => {
                        device.receive(item);
                    }
                );
            }, Math.random() * 500);
        }
    });
}

function spawnPacket(fromElem, toElem, type, onFinish) {
    const container = document.querySelector(".network-container");
    const contRect = container.getBoundingClientRect();
    const fromRect = fromElem.getBoundingClientRect();
    const toRect = toElem.getBoundingClientRect();

    const packet = document.createElement("div");
    packet.className = `packet ${type}`;
    container.appendChild(packet);

    // Calculate start/end relative to the container specifically
    // This ensures scrolling doesn't break the animation coordinates
    const startX = fromRect.left - contRect.left + fromRect.width / 2;
    const startY = fromRect.top - contRect.top + fromRect.height / 2;
    const endX = toRect.left - contRect.left + toRect.width / 2;
    const endY = toRect.top - contRect.top + toRect.height / 2;

    packet.animate(
        [{
                left: `${startX}px`,
                top: `${startY}px`,
            },
            {
                left: `${endX}px`,
                top: `${endY}px`,
            },
        ], {
            duration: 600,
            easing: "ease-in-out",
            fill: "forwards",
        }
    ).onfinish = () => {
        packet.remove();
        if (onFinish) onFinish();
    };
}