import Default from './default';

import Utils from '@kaetram/common/util/utils';
import { Modules } from '@kaetram/common/network';

import type Mob from '@kaetram/server/src/game/entity/character/mob/mob';

export default class ForestDragon extends Default {
    private specialAttack = false;

    public constructor(mob: Mob) {
        super(mob);
    }

    /**
     * Every attack the Queen Ant has a small chance of using a special attack. A special
     * attack indicates the queen transitions to a ranged attack style, and will have a chance
     * of an AoE attack alongside terror infliction.
     */

    protected override handleAttack(): void {
        super.handleAttack();

        // Ignore the special attack if one is already active.
        if (this.specialAttack) return this.resetSpecialAttack();

        // 1 in 6 chance to trigger a special attack.
        if (Utils.randomInt(1, 6) !== 2) return;

        // Inflict terror on the target.
        this.mob.attackRange = 9;
        this.mob.damageType = Modules.Hits.Terror;

        this.specialAttack = true;
    }

    /**
     * Updates the attack style with each call of the combat loop.
     */

    protected override handleCombatLoop(): void {
        super.handleCombatLoop();

        if (this.specialAttack) return;

        // Determine whether or not to use ranged attacks.
        let useRanged =
            this.mob.getDistance(this.mob.target!) > 1 || this.mob.target!.isRanged() || this.mob.target!.moving;

        this.mob.damageType = Modules.Hits.Normal;

        // Update the mob's range distance.
        this.mob.attackRange = useRanged ? 10 : 1;

        // Updates the projectile per combat loop to reset the special attack.
        if (useRanged) this.mob.projectileName = 'fireball';
    }

    /**
     * Resets the special attack ability by removing the mob's attack range.
     */

    private resetSpecialAttack(): void {
        this.specialAttack = false;
        this.mob.attackRange = 1;
    }
}
