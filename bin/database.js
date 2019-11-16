const fs = require("fs");
const path = require("path");
const DATA_PATH = "/etc/nginx-server-block-proxy-tool/data.json";
const { updateNginxConfig } = require("./nginx-config-gen");
const { highlight } = require("./highlight");
const columns = ["name", "domain", "port", "https", "enabled", "email", "hsts"]
const defaultBlock = { https: "false", enabled: "true", email: "j.jantschulev@gmail.com", hsts: "false" }
const data = loadData();

function ensureDirectoryExistence(filePath) {
    var dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

function loadData() {

    ensureDirectoryExistence(DATA_PATH);
    if (fs.existsSync(DATA_PATH)) {
        const fileContent = fs.readFileSync(DATA_PATH, { encoding: "utf-8" });
        return JSON.parse(fileContent).map(b => ({ ...defaultBlock, ...b }));
    }
    return [];
}

function saveData() {
    ensureDirectoryExistence(DATA_PATH);
    fs.writeFileSync(DATA_PATH, JSON.stringify(data), { encoding: "utf-8" });
    console.log(highlight("Success! Data saved."));
    updateNginxConfig(data);
}

function dbInsert(block) {
    if (block.port < 1024 || block.port > 65536 || isNaN(block.port)) {
        return console.log("Error, port must be > 1024 and < 65536");
    }
    if (data.find(e => e.name === block.name)) {
        return console.log(
            "Error. Application with that name already exists.\n Please use the edit command"
        );
    }
    if (data.find(e => e.domain === block.domain)) {
        return console.log(
            "Error. Application with that (sub)domain already exists.\n Please use the edit command"
        );
    }
    data.push({ ...defaultBlock, ...block });
    saveData();
}

function dbUpdate(name, key, value) {
    if (!data.find(e => e.name === name))
        return console.log("Name does not exist");
    if (!columns.includes(key))
        return console.log(`Error: key must be either ${columns.join(" or ")}`);
    if (key === "port") value = parseInt(value, 10);
    if (key === "port" && (value < 1024 || value > 65536))
        return console.log("Error, port must be > 1024 and < 65536");

    data.find(e => e.name === name)[key] = value;
    saveData();
}

function dbDelete(name) {
    const index = data.findIndex(e => e.name === name);
    if (index === -1) return console.log("Name does not exist");
    data.splice(index, 1);
    saveData();
}

function print() {
    const titles = columns.reduce((p, c) => ({ ...p, [c]: c }), {});
    const longest = data.reduce(
        (prev, curr) => {
            const newLongest = { ...prev };
            for (let k in prev) {
                if (curr[k]) {
                    if (curr[k].toString().length > prev[k].length) {
                        newLongest[k] = curr[k].toString();
                    }
                }
            }
            return newLongest;
        },
        { ...titles }
    );
    [titles, ...data].forEach((el, i) => {
        let str = "";
        for (let k in titles) {
            const padding = longest[k].length - el[k].toString().length + 3;
            str += el[k] + " ".repeat(padding);
        }
        if (i === 0) str = highlight(str);
        console.log(str);
    });
}

function getData() {
    return data;
}

module.exports = { dbInsert, saveData, loadData, dbUpdate, dbDelete, print, columns, getData };
