/*
 * The Smite macro emulates the Divine Smite feature of Paladins in DnD 5e. A spell slot level to use
 * can be selected, which increases the number of damage dice, and smiting a fiend or undead
 * will also increase the number of damage dice.
 * 
 * First, select a token to perform the smite, then target an enemy to be smitten. Make your regular 
 * attack and then if you choose to use Divine Smite, run this macro.
 */

let confirmed = false;

// Create a dialogue box to select spell slot level to use when smiting.
new Dialog({
    title: "Divine Smite Damage",
    content: `
     <form>
     <p>Spell Slot level to use Divine Smite with.</p>
      <div class="form-group">
       <label>Spell Slot Level:</label>
       <select name="slot-level">
        <option value="1">1</option>
        <option value="2">2</option>
        <option value="3">3</option>
        <option value="4">4</option>
        <option value="5">5</option>
       </select>
       </div>
       <div class="form-group">
       <label>Critical Hit:</label>
       <input type="checkbox" name="criticalCheckbox">
      </div>
     </form>
     `,
    buttons: {
        one: {
            icon: '<i class="fas fa-check"></i>',
            label: "SMITE!",
            callback: () => confirmed = true
        },
        two: {
            icon: '<i class="fas fa-times"></i>',
            label: "Cancel",
            callback: () => confirmed = false
        }
    },
    default: "Cancel",
    close: html => {
        if (confirmed) {
            let slotLevel = parseInt(html.find('[name=slot-level]')[0].value);
            let criticalHit = html.find('[name=criticalCheckbox]')[0].checked;
            smite(slotLevel, criticalHit);
        }
    }
}).render(true);

/**
 * Gives the spell slot information for a particular actor and spell slot level.
 * @param {Actor5e} actor - the actor to get slot information from.
 * @param {integer} level - the spell slot level to get information about. level 0 is deprecated.
 * @returns {object} contains value (number of slots remaining), max, and override.
 */
function getSpellSlots(actor, level) {
    let spells = actor.data.data.spells;
    switch (level) {
        case 1:
            return spells.spell1;
        case 2:
            return spells.spell2;
        case 3:
            return spells.spell3;
        case 4:
            return spells.spell4;
        case 5:
            return spells.spell5;
    }
}

/**
 * Use the controlled token to smite the targeted token.
 * @param {integer} slotLevel - the spell slot level to use when smiting.
 * @param {boolean} criticalHit - whether the hit is a critical hit.
 */
function smite(slotLevel, criticalHit) {
    let targets = game.user.targets;
    let suseptible = ["fiend", "undead"];
    let controlledActor = canvas.tokens.controlled[0].actor;
    let chosenSpellSlots = getSpellSlots(controlledActor, slotLevel);

    if (chosenSpellSlots.value < 1) {
        ui.notifications.error("No spell slots of the required level available.");
        return;
    }
    if (targets.size !== 1) {
        ui.notifications.error("You must target exactly one token to Smite.");
        return;
    }

    targets.forEach(target => {
        let numDice = slotLevel + 1;
        let type = target.actor.data.data.details.type?.toLocaleLowerCase();
        if (suseptible.includes(type)) numDice += 1;
        if (criticalHit) numDice *= 2;
        new Roll(`${numDice}d8`).roll().toMessage({ flavor: "Macro Divine Smite - Damage Roll (Radiant)", speaker })
    })

    let objUpdate = new Object();
    objUpdate['data.spells.spell' + slotLevel + '.value'] = chosenSpellSlots.value - 1;
    controlledActor.update(objUpdate);
}