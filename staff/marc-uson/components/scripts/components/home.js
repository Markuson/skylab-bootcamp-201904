'use strict';

function Home(container, onLogOutClick, onSearch, onSelect) {
    Component.call(this, container);

    var form = this.container.children[1];
    new Search(form, onSearch);

    var ul = this.container.children[2];
    var results = new Results(ul, onSelect);
    this.__results__ = results;

    var section = this.container.children[3];
    var selectedItem = new SelectedItem(section);
    selectedItem.visible = false;
    this.__selectedItem__ = selectedItem;

    var link = this.container.children[4];

    link.addEventListener('click', function(){
        event.preventDefault();

        onLogOutClick();
    })
}

Home.prototype = Object.create(Component.prototype);
Home.prototype.constructor = Home;

Object.defineProperty(Home.prototype, 'results', {
    set: function(results) {
        this.__results__.items = results;
        this.__results__.visible = true;
        this.__selectedItem__.visible = false;
    }
});

Object.defineProperty(Home.prototype, 'selectedItem', {
    set: function(results) {
        this.__selectedItem__.items = results;
        this.__selectedItem__.visible = true;
        this.__results__.visible = false;
    }
});