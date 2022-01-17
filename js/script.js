let traitRepo = (function() {

    const traits = [];

    function parseTraitsJSON(url) {
        fetch('https://kody104.github.io/TS4-Legacy/js/traits.json').then( response => response.json()
        ).then( data => {
            data.traits.forEach( trait => {
                traits.push(trait);
            })
        })
        .catch(error => {
            console.warn(error);
        });;
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

    parseTraitsJSON();
    
    return {
        getTraitByName: getTraitByName,
        getTraitsByCategory: getTraitsByCategory,
        getAll: getAll
    }
})();
let dynastyRepo = (function() {
    let members = [
        /*{
            firstName: 'test',
            lastName: 'one'
        },
        {
            firstName: 'test',
            lastName: 'two'
        }*/
    ];

    function getAll() {
        return members;
    }

    function deleteMember(index) {
        members.splice(index, 1);
    }

    function clear() {
        members = [];
    }

    return {
        getAll: getAll,
        deleteMember: deleteMember,
        clear: clear
    }
})();
let running = (function() {

    let slide = {
        in: (element) => {
            return new Promise(resolve => {
                element.classList.add('slide-in');
                element.classList.remove('is-hidden');
                setTimeout(function () {
                    element.classList.remove('slide-in');
                    resolve();
                }, 250);
            });
        },
        out: (element) => {
            return new Promise(resolve => {
                element.classList.add('slide-out');
                setTimeout(function() {
                    element.classList.remove('slide-out');
                    element.classList.add('is-hidden');
                    resolve();
                }, 250);
            });
        }
    };

    function init() {
        let prevContainer = document.querySelector('#previous-sims-list');
        let clearBtn = document.createElement('button');
        clearBtn.classList.add('button');
        clearBtn.style.width = '100%';
        clearBtn.innerText = 'Clear';
        clearBtn.addEventListener('click', () =>{
            deleteFamilyDynasty();
        });
        document.querySelector('#previous-sims-column h3.column-title').after(clearBtn);

        if(dynastyRepo.getAll().length === 0) {
            let list = document.createElement('ul');
            let text = document.createElement('li');
            text.innerText = 'Create a new sim';
            text.classList.add('button');
            text.addEventListener('click', () =>{
                createSim();
            });
            list.appendChild(text);
            prevContainer.appendChild(list);
            clearBtn.disabled = true;
        } else {
            let list = document.createElement('ul');
        
            dynastyRepo.getAll().reverse().forEach(member => {
                let li = document.createElement('li');
                li.classList.add('button');
                li.innerText = member.firstName + ' ' + member.lastName;
                li.addEventListener('click', () => {
                    selectSim(member, li);
                });
                list.appendChild(li);
            });
        
            prevContainer.appendChild(list);
        }   
    }

    function refresh() {
        let prevContainer = document.querySelector('#previous-sims-list');
        let clearBtn = document.querySelector('#previous-sims-column button.button');
        if(!clearBtn) {
            clearBtn.classList.add('button');
            clearBtn.style.width = '100%';
            clearBtn.innerText = 'Clear';
            clearBtn.addEventListener('click', () =>{
                deleteFamilyDynasty();
            });
            document.querySelector('#previous-sims-column h3.column-title').after(clearBtn);
        }

        if(dynastyRepo.getAll().length === 0) {
            let list = document.querySelector('#previous-sims-list ul');
            if(list) {
                list.innerHTML = '';
            }
            else {
                list = document.createElement('ul');
            }
            let text = document.createElement('li');
            text.innerText = 'Create a new sim';
            text.addEventListener('click', () =>{
                createSim();
            });
            text.classList.add('button');
            list.appendChild(text);
            prevContainer.appendChild(list);
            clearBtn.disabled = true;
        } else {
            let list = document.querySelector('#previous-sims-list ul');
            if(list) {
                list.innerHTML = '';
            }
            else {
                list = document.createElement('ul');
            }
        
            dynastyRepo.getAll().reverse().forEach(member => {
                let li = document.createElement('li');
                li.classList.add('button');
                li.innerText = member.firstName + ' ' + member.lastName;
                li.addEventListener('click', () => {
                    selectSim(member, li);
                });
                list.appendChild(li);
            });
            prevContainer.appendChild(list);
            clearBtn.disabled = false;
        }
    }

    function createSim() {
        let prevContainer = document.querySelector('#previous-sims-column');
        let createContainer = document.querySelector('#create-a-sim');
        let backBtn = document.querySelector('#back-button');

        backBtn.addEventListener('click', () => {
            slide.out(createContainer)
            .then( () => slide.in(prevContainer));
            backBtn.removeEventListener('click', this);
        });
        
        slide.out(prevContainer)
        .then( () => slide.in(createContainer));

        let traitList = document.querySelector('#trait-list');
        traitList.innerHTML = '';
        traitRepo.getAll().forEach( trait => {
            let li = document.createElement('li');
            li.classList.add('button');
            li.style.background = `white url(${trait.icon_url}) no-repeat center`;
            li.style.background

            li.innerHTML += trait.name;

            traitList.appendChild(li);
        });
    }

    function selectSim(sim, li) {
        let list = document.querySelector('#previous-sims-list ul');
        let items = list.childNodes;
        items.forEach(item => {
            if(li !== null && sim !== null) {
                if(item.isEqualNode(li)) {
                    item.classList.add('is-selected');
                } else {
                    item.classList.remove('is-selected');
                }
            } else {
                item.classList.remove('is-selected');
            }
        });
    }

    function deleteFamilyDynasty() {
        if(confirm('Are you sure you want to delete your legacy family?')) {
            dynastyRepo.clear();
            refresh();
        }
    }

    return {
        init: init
    }
})();

running.init();