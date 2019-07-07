import { PubSub } from 'apollo-server';
import * as LINK_EVENTS from './link';
import * as TAG_EVENTS from './tag';

export const EVENTS = {
    LINK: LINK_EVENTS,
    TAG: LINK_EVENTS
}

export default new PubSub();
