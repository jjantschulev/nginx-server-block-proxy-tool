const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { createCert } = require("./https");
const TEMPLATE_PATH = path.join(__dirname, "server-block-template");
const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");
const { highlight } = require("./highlight");

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
    const flags = [block.https === 'true', block.hsts === 'true'];
    return replacePlaceholdersWithValues(values, flags);
}

function updateNginxConfig(data) {
    if (!fs.existsSync("/etc/nginx/sites-available"))
        throw "Nginx not installed correctly";

    // Clean Up
    execSync("sudo rm -f /etc/nginx/sites-available/*.nsbpt");
    execSync("sudo rm -f /etc/nginx/sites-enabled/*.nsbpt");

    data.filter(block => block.enabled === 'true').forEach(block => {
        if (block.https === 'true') {
            // Generate Cert
            createCert(block.domain, block.email);
        }
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
    execSync("sudo systemctl restart nginx");
    console.log(highlight("Nginx server restarted."));
}

module.exports = { updateNginxConfig, generateServerBlockString };
