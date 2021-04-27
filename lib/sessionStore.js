const mongoose = require('mongoose');
const express = require('express');
const MongoStore = require('connect-mongo');
const config = require('../config/index')

const sessionStore =  MongoStore.create({
    mongoUrl: config.get("mongoose:uri")
  });

// const sessionStore = new MongoStore({mongoUrl: config.get("mongoose:uri")});

module.exports = sessionStore;
