let traitRepo = (function() {

    const traits = [];

    function parseJSON() {
        const jsonData = require('./traits.json');
        jsonData.traits.forEach( trait => {
            traits.push(trait);
        });
    }

    function getTraitByName(tName) {
        for(let i = 0; i < traits.length; i++) {
            if(traits[i].name.toLowerCase() === tName.toLowerCase()) {
                return traits[i];
            }
        }
    }

    function getTraitsByCategory(cName) {
        const list = [];
        traits.forEach(trait => {
            if(trait.category === cName) {
                list.push(trait);
            }
        });
        return list;
    }

    function getAll() {
        return traits;
    }

    parseJSON();
    
    return {
        getTraitByName: getTraitByName,
        getTraitsByCategory: getTraitsByCategory,
        getAll: getAll
    }
})();
