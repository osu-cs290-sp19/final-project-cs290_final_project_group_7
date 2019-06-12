var twitContext = {
	text: twitText,
	author: twitAuthor
};

var twitHTML = Handlebars.templates.twit(twitContext);

var twitContainer = document.querySelector('main.twit-container');
twitContainer.insertAdjacentHTML('beforeend', twitHTML);