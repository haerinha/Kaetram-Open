import Menu from './menu';

import Player from '../entity/character/player/player';

export default class Quests extends Menu {
    public constructor(private player: Player) {
        super('#quests', '#close-quests', '#quests-button');
    }
}
