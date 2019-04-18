'use strict';

function Results(ul, onSelect) {
    Component.call(this, ul);
    this.onSelect = onSelect;

}

Results.prototype = Object.create(Component.prototype);
Results.prototype.constructor = Results;

Object.defineProperty(Results.prototype, 'items', {
    set: function(items) {
        while (this.container.firstElementChild) this.container.removeChild(this.container.firstElementChild);
        items.forEach(function(item) { // id, title, image, price
            var li = document.createElement('li');
            li.setAttribute('data-id', item.id);

            var h3 = document.createElement('h3');
            h3.innerText = item.title;
            li.appendChild(h3);

            var img = document.createElement('img');
            img.src = item.image;
            img.style.width = '200px';
            li.appendChild(img);

            var span = document.createElement('span');
            span.innerText = item.price;
            li.appendChild(span);

            li.addEventListener('click', function(event){
                this.visible = false;
                this.onSelect(item.id);
                // console.log('cosa', item.id, this);
            }.bind(this));

            this.container.appendChild(li);
            this.visible = true;
        }.bind(this));
    }
});
