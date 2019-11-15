const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TEMPLATE_PATH = path.join(__dirname, "server-block-template");
const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");

function replacePlaceholdersWithValues(values) {
    let str = template.slice(0);
    for (let i = 0; i < values.length; i++) {
        str = str.replace(`@${i + 1}`, values[i]);
    }
    return str;
}

function generateServerBlockString(block) {
    const values = [block.domain, block.port];
    return replacePlaceholdersWithValues(values);
}

function updateNginxConfig(data) {
    if (!fs.existsSync("/etc/nginx/sites-avaliable/"))
        throw "Nginx not installed correctly";

    data.forEach(block => {
        const str = generateServerBlockString(block);
        // Save the configuration
        const p = path.join("/etc/nginx/sites-avaliable", block.domain);
        fs.writeFileSync(p, str, { encoding: "utf-8" });
        // Enable this block
        const symPath = path.join("/etc/nginx/sites-enabled", block.domain);
        fs.symlinkSync(p, symPath);
    });

    // Restart Nginx Webserver
    execSync("sudo systemctl restart nginx");
}

module.exports = { updateNginxConfig, generateServerBlockString };
