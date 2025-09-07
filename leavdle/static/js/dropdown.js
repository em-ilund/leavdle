document.addEventListener('DOMContentLoaded', function () {
    const element = document.getElementById('sketch_select');
    const choices = new Choices(element, {
    searchEnabled: true,
    itemSelectText: '',
    shouldSort: false
    });
});