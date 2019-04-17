'use strict';

function Home(container, onLogOutClick) {
    Component.call(this, container);

    var link = this.container.children[0];

    link.addEventListener('click', function(){
        event.preventDefault();

        onLogOutClick();
    })
}

Home.prototype = Object.create(Component.prototype);
Home.prototype.constructor = Home;