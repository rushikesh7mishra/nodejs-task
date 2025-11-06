// src/jobs/agenda.js
const Agenda = require('agenda');
const config = require('../config');

let agendaInstance = null;

async function initAgenda() {
  if (agendaInstance) return agendaInstance; // already started
  agendaInstance = new Agenda({ db: { address: config.MONGO_URI, collection: 'agendaJobs' } });

  // load job definitions
  require('./orderTimeout.job')(agendaInstance);

  await agendaInstance.start();
  console.log('Agenda started');
  return agendaInstance;
}

function getAgenda() {
  return agendaInstance;
}

module.exports = { initAgenda, getAgenda };
