const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

const GYNOID_EVENTS = require('./events');

const mappedEvents = {};

mappedEvents[GYNOID_EVENTS.AUTHENTICATED] = CLIENT_EVENTS.RTM.AUTHENTICATED;
mappedEvents[GYNOID_EVENTS.CONNECTION_FAILURE] = CLIENT_EVENTS.RTM.UNABLE_TO_RTM_START;
mappedEvents[GYNOID_EVENTS.CONNECTION_OPENED] = CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED;
mappedEvents[GYNOID_EVENTS.MESSAGE] = RTM_EVENTS.MESSAGE;
mappedEvents[GYNOID_EVENTS.REACTION_ADDED] = RTM_EVENTS.REACTION_ADDED;
mappedEvents[GYNOID_EVENTS.REACTION_REMOVED] = RTM_EVENTS.REACTION_REMOVED;

module.exports = mappedEvents;