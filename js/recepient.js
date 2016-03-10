var Recepient = function Recepient(id, name, photo, type) {
    this.type = type;
    this.id = id;
    this.name = name;
    this.photo = photo;
    return this;
}
Recepient.prototype.TYPE_USER = '1';
Recepient.prototype.TYPE_CHAT = '2';