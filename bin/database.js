const fs = require("fs");
const path = require("path");
const DATA_PATH = path.join(__dirname, "../data.json");
const data = loadData();

function loadData() {
    if (fs.existsSync(DATA_PATH)) {
        const fileContent = fs.readFileSync(DATA_PATH, { encoding: "utf-8" });
        return JSON.parse(fileContent);
    }
    return [];
}

function saveData() {
    fs.writeFileSync(DATA_PATH, JSON.stringify(data), { encoding: "utf-8" });
    console.log(highlight("Success! Data saved."));
}

function dbInsert(ob) {
    const name = ob.name;
    const domain = ob.domain;
    const port = parseInt(ob.port, 10);
    if (port < 1024 || port > 65536) {
        return console.log("Error, port must be > 1024 and < 65536");
    }
    if (data.find(e => e.name === name)) {
        return console.log(
            "Error. Application with that name already exists.\n Please use the edit command"
        );
    }
    if (data.find(e => e.domain === domain)) {
        return console.log(
            "Error. Application with that (sub)domain already exists.\n Please use the edit command"
        );
    }
    if (data.find(e => e.port === port)) {
        return console.log(
            "Error. Application with that port already exists.\n Please choose a different port"
        );
    }
    data.push({ name, domain, port });
    saveData();
}

function dbUpdate(name, key, value) {
    if (!data.find(e => e.name === name))
        return console.log("Name does not exist");
    if (!["domain", "port"].includes(key))
        return console.log("Error: key must be 'domain' or 'port'");
    if (key === "port") value = parseInt(value, 10);
    if (key === "port" && (value < 1024 || value > 65536))
        return console.log("Error, port must be > 1024 and < 65536");
    data.find(e => e.name === name)[key] = value;
    saveData();
}

function dbDelete(name) {
    const index = data.find(e => e.name === name);
    if (!index === -1) return console.log("Name does not exist");
    data.splice(index, 1);
    saveData();
}

function print() {
    const longest = data.reduce(
        (prev, curr) => {
            const newLongest = { ...prev };
            for (let k in prev) {
                if (curr[k].length > prev[k]) {
                    newLongest[k] = curr[k].length;
                }
            }
            return newLongest;
        },
        { name: 4, domain: 6, port: 4 }
    );
    const titles = {
        name: "Name",
        domain: "Domain",
        port: "Port"
    };
    [titles, ...data].forEach((el, i) => {
        let str = "";
        for (let k in el) {
            const padding = longest[k] - el[k].length + 3;
            str += el[k] + " ".repeat(padding);
        }
        if (i === 0) str = highlight(str);
        console.log(str);
    });
}

function highlight(text) {
    return `\x1b[36m${text}\x1b[0m`;
}

module.exports = { dbInsert, saveData, loadData, dbUpdate, dbDelete, print };
