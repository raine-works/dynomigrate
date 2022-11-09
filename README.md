# Dynomigrate

### Dynomigrate is a simple cli tool that makes it easy to migrate DynamoDB data from one table to another table.

<br/>

# Installation

    npm install -g dynomigrate

## Commands

<br/>

### Required arguments include origin, target, and region.

<br/>

-   origin (required): The table to migrate data from
-   target (required): The table to migrate data to
-   region (required): The aws region where your dynamoDB tables are stored
-   profile (optional): The AWS profile

<br/>

    dynomigrate --origin <origin-tabke> --target <target-table> --region us-west-2

### Dynomigrate is non-desctuctive which means your tables are only copied.

<br/>

### Author: raine-works
