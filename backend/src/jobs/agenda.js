const Agenda = require('agenda');
const config = require('../config');

let agenda;

async function initAgenda() {
  if (agenda) return agenda;
  agenda = new Agenda({ db: { address: config.MONGO_URI, collection: 'agendaJobs' } });
  require('./orderTimeout.job')(agenda);
  await agenda.start();
  console.log('Agenda started');
  return agenda;
}

function getAgenda() {
  return agenda;
}

module.exports = { initAgenda, getAgenda, agendaRef: () => agenda };
