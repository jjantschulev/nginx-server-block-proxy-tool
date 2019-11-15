#!/usr/bin/env node

const program = require("commander");
const { prompt } = require("inquirer");
const { dbInsert, dbUpdate, dbDelete, print } = require("./database");
const { generateServerBlockString } = require("./nginx-config-gen");

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
    { type: "input", name: "port", message: "Enter node.js server port: " }
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
    .description("Show all configurations")
    .action(() => {
        print();
    });

program.command("test").action(() => {
    const data = [
        { name: "auth", domain: "auth.ausjan.com", port: 3001 },
        { name: "markdown", domain: "markdown.ausjan.com", port: 3002 },
        { name: "photos", domain: "photos.ausjan.com", port: 3003 }
    ];
    data.forEach(block => {
        console.log(generateServerBlockString(block));

        console.log("==================================================");
    });
});

program.parse(process.argv);
