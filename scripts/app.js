'use strict'

let habbits = [];
const HABBIT_KEY = 'HABBIT_KEY';
let globalActiveHabbitId;

/* page */
const page = {
	menu: document.querySelector('.menu__list'),
	header: {
		h1: document.querySelector('.h1'),
		progressPercent: document.querySelector('.progress__percent'),
		progressCoverBar: document.querySelector('.progress__cover-bar'),
	},
	content: {
		habbits: document.querySelector('.habbit__list'),
		nextDay: document.querySelector('.habbit__day'),
	},
	popup: {
		container: document.getElementById('add-habbit-popup'),
		iconField: document.querySelector('.popup__form input[name="icon"]'),
		form: document.querySelector('.popup__form'),
	}
};

/* utils */
function loadData() {
	const habbitsString = localStorage.getItem(HABBIT_KEY);
	
	const habbitArr = JSON.parse(habbitsString);

	if (Array.isArray(habbitArr)) {
		habbits = habbitArr;
	}
}

function saveData() {
	localStorage.setItem(HABBIT_KEY, JSON.stringify(habbits));
}

function togglePopup() {
	const isHidden = page.popup.container.classList.contains('cover_hidden');

	if (isHidden) {
		page.popup.container.classList.remove('cover_hidden');
		resetForm(page.popup.form);
	} else {
		page.popup.container.classList.add('cover_hidden');
	}
}

function validateAndGetFormData(form, fields) {
	const formData = new FormData(form);
	const res = {};
	let isValid = true;

	for (const field of fields) {
		const fieldValue = formData.get(field);

		form[field].classList.remove('error');

		if (!fieldValue) {
			form[field].classList.add('error');

			isValid = false;
		}

		res[field] = fieldValue;
	}

	if (!isValid) {
		return;
	}

	return res;
}

function resetForm(form) {
	form.reset();
}

/* render */
function rerenderMenu(activeHabbit) {
	for (const habbit of habbits) {
		const existed = document.querySelector(`[menu-habbit-id="${habbit.id}"]`);

		if (!existed) {
			// создание
			const element = document.createElement('button');
			element.setAttribute('menu-habbit-id', habbit.id);
			element.classList.add('menu__item');
			element.addEventListener('click', () => {
				rerender(habbit.id);
			});
			element.innerHTML = `<img src="./images/${habbit.icon}.svg" alt="${habbit.name}">`;

			if (activeHabbit.id === habbit.id) {
				element.classList.add('menu__item_active');
			}

			page.menu.appendChild(element);

			continue;
		}

		if (activeHabbit.id === habbit.id) {
			existed.classList.add('menu__item_active');
		} else {
			existed.classList.remove('menu__item_active');
		}
	}
}

function rerenderHead(activeHabbit) {
	page.header.h1.innerText = activeHabbit.name;

	const daysLengthToTarget = activeHabbit.days.length / activeHabbit.target;
	const progress = daysLengthToTarget > 1 ? 100 : daysLengthToTarget * 100;
	page.header.progressPercent.innerText = `${progress.toFixed(0)}%`;
	page.header.progressCoverBar.setAttribute('style', `width: ${progress}%`);
}

function rerenderContent(activeHabbit) {
	page.content.habbits.innerHTML = '';

	for (const index in activeHabbit.days) {
		const element = document.createElement('div');

		element.classList.add('habbit');
		element.innerHTML = `<div class="habbit__day">День ${Number(index) + 1}</div>
						<div class="habbit__comment">${activeHabbit.days[index].comment}</div>
						<button class="habbit__delete" onclick="deleteDay(${index})">
							<img src="./images/delete.svg" alt="">
						</button>`;

		page.content.habbits.appendChild(element);
	}

	page.content.nextDay.innerText = `День ${activeHabbit.days.length + 1}`;
}

function rerender(activeHabbitId) {
	globalActiveHabbitId = activeHabbitId;

	const activeHabbit = habbits.find(habbit => habbit.id === activeHabbitId);

	if (!activeHabbit) {
		return;
	}

	document.location.replace(document.location.pathname + '#' + activeHabbitId);

	rerenderMenu(activeHabbit);
	rerenderHead(activeHabbit);
	rerenderContent(activeHabbit);
}

/* work with days */
function addDays(event) {
	event.preventDefault();

	const form = event.target;
	const res = validateAndGetFormData(form, ['comment']);

	if (!res) {
		return;
	}

	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			return {
				...habbit,
				days: habbit.days.concat([{ comment: res['comment'] }]),
			};
		}

		return habbit;
	})

	resetForm(form);
	rerender(globalActiveHabbitId);
	saveData();
}

function deleteDay(commentIndex) {
	habbits = habbits.map(habbit => {
		if (habbit.id === globalActiveHabbitId) {
			habbit.days.splice(commentIndex, 1);
		}

		return habbit;
	})

	rerender(globalActiveHabbitId);
	saveData();
}

/* working with habbits */
function setIcon(buttonElement, iconName) {
	page.popup.iconField.value = iconName;

	const activeIcon = document.querySelector('.icon.icon_active');
	activeIcon.classList.remove('icon_active');

	buttonElement.classList.add('icon_active');
}

function addHabbit(event) {
	event.preventDefault();

	const data = validateAndGetFormData(event.target, ['icon', 'name', 'target']);

	if (!data) {
		return;
	}

	const maxId = habbits.reduce((acc, habbit) => acc > habbit.id ? acc : habbit.id, 0);
	habbits.push({
      id: maxId + 1,
      icon: data.icon,
      name: data.name,
      target: data.target,
      days: [],
	});

	togglePopup();
	rerender(maxId + 1);
	saveData();
}

function removeHabbit() {
	const activeHabbitIndex = habbits.findIndex(habbit => habbit.id === globalActiveHabbitId);
	if (activeHabbitIndex === -1) {
		console.error('[removeHabbit] - не находит текущую привычку')
		return;
	}

	habbits.splice(activeHabbitIndex, 1);

	document.querySelector(`[menu-habbit-id="${globalActiveHabbitId}"]`).remove();

	const previousHabbitId = globalActiveHabbitId - 1;
	rerender(previousHabbitId < 0 ? 0 : previousHabbitId);

	saveData();
}

/* init */
(() => {
	loadData();

	const hashId = Number(document.location.hash.replace('#', ''));
	const habbit = habbits.find(habbit => habbit.id === hashId);

	rerender(habbit ? habbit.id : habbits[0].id);
})();