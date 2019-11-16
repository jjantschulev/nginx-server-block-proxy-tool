const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const TEMPLATE_PATH = path.join(__dirname, "server-block-template");
const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");

function replacePlaceholdersWithValues(values, flags) {
    let str = template.slice(0);
    for (let i = 0; i < values.length; i++) {
        const regex = new RegExp(`@${i + 1}`, "g");
        str = str.replace(regex, values[i]);
    }
    for (let i = 0; i < flags.length; i++) {
        if (flags[i]) {
            const regex = new RegExp(`#${i + 1}`, "g");
            str = str.replace(regex, "  ");
        }
    }
    return str;
}

function generateServerBlockString(block) {
    const values = [block.domain, block.port];
    const flags = [block.https];
    return replacePlaceholdersWithValues(values, flags);
}

function updateNginxConfig(data) {
    if (!fs.existsSync("/etc/nginx/sites-available"))
        throw "Nginx not installed correctly";

    // Clean Up
    execSync("sudo rm -f /etc/nginx/sites-available/*.nsbpt");
    execSync("sudo rm -f /etc/nginx/sites-enabled/*.nsbpt");

    data.forEach(block => {
        const str = generateServerBlockString(block);
        // Save the configuration
        const p = path.join(
            "/etc/nginx/sites-available",
            block.domain + ".nsbpt"
        );
        fs.writeFileSync(p, str, { encoding: "utf-8" });
        // Enable this block
        const symPath = path.join(
            "/etc/nginx/sites-enabled",
            block.domain + ".nsbpt"
        );
        fs.symlinkSync(p, symPath);
    });

    // Restart Nginx Webserver
    execSync("sudo systemctl reload nginx");

    // generate certificates for new domains
    // execSync("sudo certbot certonly ");
}

module.exports = { updateNginxConfig, generateServerBlockString };
