'use strict';

function SelectedItem(section){
    Component.call(this, section);

}

SelectedItem.prototype = Object.create(Component.prototype);
SelectedItem.prototype.constructor = SelectedItem;

Object.defineProperty(SelectedItem.prototype, 'items', {
    set: function(items) {
        var h2 = this.container.children[0];
        h2.innerText = items.title;

        var img = this.container.children[1];
        img.src = items.image;

        var p = this.container.children[2];
        p.innerText = items.price;

        var span = this.container.children[3];
        span.innerText = items.description;

        this.visible = true;
    }
});