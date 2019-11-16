#!/usr/bin/env node

const program = require("commander");
const { prompt } = require("inquirer");
const { dbInsert, dbUpdate, dbDelete, print, getData } = require("./database");
const { updateNginxConfig } = require("./nginx-config-gen");
const { getCerts } = require("./https");


program
    .version("0.0.1")
    .description("nginx server blocks and node.js proxy management");

const newQuestions = [
    { type: "input", name: "name", message: "Enter application name: " },
    {
        type: "input",
        name: "domain",
        message: "Enter (sub)domain for server block: "
    },
    { type: "number", name: "port", message: "Enter node.js server port: " }
];

program
    .command("new")
    .description("Add a new server block configuration")
    .action(() => {
        prompt(newQuestions).then(dbInsert);
    });

program
    .command("edit <name> <assignment>")
    .description(
        "Edit an existing server block configuration. Assignment: key=value. Key can be either domain or port."
    )
    .action((name, assignment) => {
        const [key, value] = assignment.split("=");
        if (!key || !value) throw "Assignment incorrect. Refer to help.";
        dbUpdate(name, key, value);
    });

program
    .command("delete <name>")
    .description("Delete server block config by name.")
    .action(name => {
        dbDelete(name);
    });

program
    .command("list")
    .description("Show all server blocks")
    .action(() => {
        print();
    });


program.command("list-certs").description("Lists all installed letencrypt certificates").action(() => {
    getCerts();
})

program.command("delete-cert").action(() => {
    console.log("Please run\n\n    sudo certbot delete\n\nand select the domain you want to delete.")
})

program.command("update").description("Updates the nginx configuration files and reloads the server.").action(() => {
    updateNginxConfig(getData());
})




program.parse(process.argv);
