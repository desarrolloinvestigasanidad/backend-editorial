"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const basename = path.basename(__filename);
const sequelize = require("../config/database");

const db = {};

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    const imported = require(path.join(__dirname, file));

    let model;

    if (
      typeof imported === "function" &&
      Object.getPrototypeOf(imported).name === "Model"
    ) {
      // Es una clase que extiende Sequelize.Model y llama a init internamente
      model = imported;
      if (!model.sequelize) {
        // Solo inicializa si no se ha hecho ya
        model.init(model.definition(Sequelize.DataTypes), {
          sequelize,
          modelName: model.name,
          ...model.options,
        });
      }
    } else if (typeof imported === "function") {
      // Es un modelo clásico exportado como función
      model = imported(sequelize, Sequelize.DataTypes);
    } else {
      throw new Error(`❌ Modelo inválido: ${file}`);
    }

    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (typeof db[modelName].associate === "function") {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
