'use strict';

function Home(container, onLogOutClick, onSearch, onSelect) {
    Component.call(this, container);

    var form = this.container.children[1];
    new Search(form, onSearch);

    var ul = this.container.children[2];
    var results = new Results(ul, onSelect);
    this.__results__ = results;
    results.visible = false;

    var section = this.container.children[3];
    var selectedItem = new SelectedItem(section);
    this.__selectedItem__ = selectedItem;
    selectedItem.visible = false;

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
        this.__selectedItem__.visible = false;
        this.__results__.items = results;
        this.__results__.visible = true;
    }
});

Object.defineProperty(Home.prototype, 'selectedItem', {
    set: function(results) {
        this.__results__.visible = false;
        this.__selectedItem__.items = results;
        this.__selectedItem__.visible = true;
    }
});