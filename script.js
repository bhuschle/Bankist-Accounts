'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
    owner: 'Jonas Schmedtmann',
    movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
    interestRate: 1.2, // %
    pin: 1111,

    movementsDates: [
        '2019-11-18T21:31:17.178Z',
        '2019-12-23T07:42:02.383Z',
        '2020-01-28T09:15:04.904Z',
        '2020-04-01T10:17:24.185Z',
        '2020-05-08T14:11:59.604Z',
        '2020-05-27T17:01:17.194Z',
        '2020-07-11T23:36:17.929Z',
        '2020-07-12T10:51:36.790Z',
    ],
    currency: 'EUR',
    locale: 'pt-PT', // de-DE
};

const account2 = {
    owner: 'Jessica Davis',
    movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
    interestRate: 1.5,
    pin: 2222,

    movementsDates: [
        '2019-11-01T13:15:33.035Z',
        '2019-11-30T09:48:16.867Z',
        '2020-11-20T06:04:23.907Z',
        '2020-11-25T14:18:46.235Z',
        '2020-11-26T16:33:06.386Z',
        '2020-12-01T14:43:26.374Z',
        '2020-12-05T18:49:59.371Z',
        '2020-12-07T12:01:20.894Z',
    ],
    currency: 'USD',
    locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementsDate = function (date, locale) {
    const calcDaysPassed = (date, date1) =>
        Math.round(Math.abs(date1 - date) / (1000 * 60 * 60 * 24));

    const daysPassed = calcDaysPassed(new Date(), date);

    if (daysPassed === 0) return `Today`;
    if (daysPassed === 1) return `Yesterday`;
    if (daysPassed <= 7) return `${daysPassed} days ago`;

    // const day = `${date.getDate()}`.padStart(2, 0);
    // const month = `${date.getMonth() + 1}`.padStart(2, 0);
    // const year = date.getFullYear();
    // return `${month}/${day}/${year}`;

    return new Intl.DateTimeFormat(locale).format(date);
};

const formatCur = function (value, locale, currency) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
    }).format(value);
};

const displayMovements = function (acc, sort = false) {
    containerMovements.innerHTML = '';

    const movs = sort
        ? acc.movements.slice().sort((a, b) => a - b)
        : acc.movements;

    movs.forEach(function (mov, i) {
        const type = mov > 0 ? 'deposit' : 'withdrawal';

        const formattedMov = formatCur(mov, acc.locale, acc.currency);

        const date = new Date(acc.movementsDates[i]);
        const displayDate = formatMovementsDate(date, acc.locale);

        const html = `
            <div class="movements__row">
                <div class="movements__type movements__type--${type}">${
            i + 1
        } ${type}</div>
                <div class="movements__date">${displayDate}</div>
                <div class="movements__value">${formattedMov}</div>
            </div>
    `;

        containerMovements.insertAdjacentHTML('afterbegin', html);
    });
};

const calcDisplayBalance = function (acc) {
    acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
    labelBalance.textContent = `${formatCur(
        acc.balance,
        acc.locale,
        acc.currency
    )}`;
};

const calcDisplaySummary = function (acc) {
    const incomes = acc.movements
        .filter((mov) => mov > 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumIn.textContent = `${formatCur(incomes, acc.locale, acc.currency)}`;

    const out = acc.movements
        .filter((mov) => mov < 0)
        .reduce((acc, mov) => acc + mov, 0);
    labelSumOut.textContent = `${formatCur(
        Math.abs(out),
        acc.locale,
        acc.currency
    )}`;

    const interest = acc.movements
        .filter((mov) => mov > 0)
        .map((deposit) => (deposit * acc.interestRate) / 100)
        .filter((int, i, arr) => {
            // console.log(arr);
            return int >= 1;
        })
        .reduce((acc, int) => acc + int, 0);
    labelSumInterest.textContent = `${formatCur(
        interest,
        acc.locale,
        acc.currency
    )}`;
};

const createUsernames = function (accs) {
    accs.forEach(function (acc) {
        acc.username = acc.owner
            .toLowerCase()
            .split(' ')
            .map((name) => name[0])
            .join('');
    });
};
createUsernames(accounts);

const updateUI = function (acc) {
    // Display movements
    displayMovements(acc);

    // Display balance
    calcDisplayBalance(acc);

    // Display summary
    calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
    const tick = function () {
        const min = String(Math.trunc(time / 60)).padStart(2, 0);
        const sec = String(time % 60).padStart(2, 0);
        // In each call, print the remaining time to UI
        labelTimer.textContent = `${min} : ${sec}`;

        // When 0 seconds, stop timer and logout user
        if (time === 0) {
            clearInterval(timer);
            labelWelcome.textContent = 'Log in to get started';
            containerApp.style.opacity = 0;
        }

        // Decrease one second
        time--;
    };

    // Set time to 5 minutes
    let time = 300;

    // Call the timer every second
    tick();
    const timer = setInterval(tick, 1000);
    return timer;
};
///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// // FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

// // Experimenting with API
// const now = new Date();
// labelDate.textContent = new Intl.DateTimeFormat('en-GB').format(now);

btnLogin.addEventListener('click', function (e) {
    // Prevent form from submitting
    e.preventDefault();

    currentAccount = accounts.find(
        (acc) => acc.username === inputLoginUsername.value
    );
    // console.log(currentAccount);

    if (currentAccount?.pin === +inputLoginPin.value) {
        // Display UI and message
        labelWelcome.textContent = `Welcome back, ${
            currentAccount.owner.split(' ')[0]
        }`;
        containerApp.style.opacity = 100;

        // Create Current date and Time
        const now = new Date();
        const options = {
            hour: 'numeric',
            minute: 'numeric',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
            // weekday: 'long',
        };

        // const locale = navigator.language
        // console.log(locale)

        labelDate.textContent = new Intl.DateTimeFormat(
            `${currentAccount.locale}`,
            options
        ).format(now);

        // Clear input fields
        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();

        if (timer) clearInterval(timer);

        timer = startLogoutTimer();

        // Update UI
        updateUI(currentAccount);
    }
});

btnTransfer.addEventListener('click', function (e) {
    e.preventDefault();
    const amount = +inputTransferAmount.value;
    const receiverAcc = accounts.find(
        (acc) => acc.username === inputTransferTo.value
    );
    inputTransferAmount.value = inputTransferTo.value = '';

    if (
        amount > 0 &&
        receiverAcc &&
        currentAccount.balance >= amount &&
        receiverAcc?.username !== currentAccount.username
    ) {
        // Doing the transfer
        currentAccount.movements.push(-amount);
        receiverAcc.movements.push(amount);

        // Add transfer date
        currentAccount.movementsDates.push(new Date().toISOString());
        receiverAcc.movementsDates.push(new Date().toISOString());

        // Update UI
        updateUI(currentAccount);

        // Reset the timer
        clearInterval(timer);
        timer = startLogoutTimer();
    }
});

btnLoan.addEventListener('click', function (e) {
    e.preventDefault();

    const amount = Math.floor(inputLoanAmount.value);

    if (
        amount > 0 &&
        currentAccount.movements.some((mov) => mov >= amount * 0.1)
    ) {
        setTimeout(function () {
            // Add movement
            currentAccount.movements.push(amount);

            // Add loan Date
            currentAccount.movementsDates.push(new Date().toISOString());

            // Update UI
            updateUI(currentAccount);

            // Reset the timer
            clearInterval(timer);
            timer = startLogoutTimer();
        }, 2500);
    }
    inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
    e.preventDefault();

    if (
        inputCloseUsername.value === currentAccount.username &&
        +inputClosePin.value === currentAccount.pin
    ) {
        const index = accounts.findIndex(
            (acc) => acc.username === currentAccount.username
        );
        console.log(index);
        // .indexOf(23)

        // Delete account
        accounts.splice(index, 1);

        // Hide UI
        containerApp.style.opacity = 0;
    }

    inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
    e.preventDefault();
    displayMovements(currentAccount.movements, !sorted);
    sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

/*
console.log(23 === 23.0);

// base 10 - 0-9
// binary base 2 - 0, 1
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

console.log('23');
console.log(Number('23'));
console.log(+'23');

// PARSING
console.log(Number.parseInt('  30px', 10));
console.log(Number.parseInt('e23', 10));
console.log(Number.parseFloat('2.5rem  '));
console.log(Number.parseInt('  2.5rem'));
// console.log(parseFloat('2.5rem')); Not recommended, call on Number

// Check if value is === NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20X'));
console.log(Number.isNaN(23 / 0)); // This is why it is not the best usecase

// Checking if value is a number
console.log(Number.isFinite(20), 20);
console.log(Number.isFinite(20 / 0), 20 / 0);
console.log(Number.isFinite('20'), '20');
console.log(Number.isFinite(+'20X'), +'20X');

console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));

//SQRT
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(8 ** (1 / 3));

// MAX
console.log(Math.max(5, 18, 99, 23, 42));
console.log(Math.max(5, 18, '99', 23, 42));

// MIN
console.log(Math.min(5, 18, 99, 23, 42));

// PI
console.log(Math.PI * Number.parseFloat('10px') ** 2);

// RANDOM
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
    Math.trunc(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max - min) -> (min)...(max)
console.log(randomInt(10, 20));

// Rounding Integers
console.log(Math.trunc(23.3));

console.log(Math.round(23.3));
console.log(Math.round(23.6));

console.log(Math.ceil(23.3));
console.log(Math.ceil(23.6));

console.log(Math.floor(23.3));
console.log(Math.floor(23.6));

// Rounding Decimals
// toFixed --- ALWAYS RETURNS A STRING
console.log((2.7).toFixed(0));
console.log((2.7).toFixed(3));
console.log((2.75234526).toFixed(2));
console.log(+(2.75234526).toFixed(2));

console.log(5 % 2);
console.log(5 / 2); // 5 = 2 * 2 + 1

console.log(8 % 3);
console.log(8 / 3); // 8 = 2 * 3 + 2

console.log(6 % 2);

const isEven = (n) => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(3));

labelBalance.addEventListener('click', function () {
    [...document.querySelectorAll('.movements__row')].forEach(function (
        row,
        i
    ) {
        if (i % 2 === 0) row.style.backgroundColor = 'orangered';
        if (i % 3 === 0) row.style.backgroundColor = 'blue';
        if (i % 2 === 1) row.style.backgroundColor = 'pink';
    });
});

console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

// BIGINT
console.log(654689764154684736735486736543758354986n);
console.log(BigInt(874897465416841657635435732541654354));

// OPERATIONS
console.log(10000n + 10000n);
console.log(657643743546743573654357354354n * 4897465463543543138534354n);
const huge = 67864354574345373545643n;
const num = 23;
console.log(huge * BigInt(num));

// EXCEPTIONS
console.log(20n > 5);
console.log(20n === 20);
console.log(20n == 20);
console.log(typeof 20n);

console.log(huge + ' is REALLY Big.... (THATS WHAT SHE SAID)');

// Division
console.log(11n / 3n);
console.log(11 / 3);

// Create a date
const now = new Date();
console.log(now);

console.log(new Date('Dec 06 2020 18:39:50'));
console.log(new Date('December 24,2020'));
console.log(new Date(account1.movementsDates[0]));

console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 31, 15, 23, 5));

console.log(new Date(0));
console.log(new Date(3 * 24 * 60 * 60 * 1000));

// Working with Dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.toISOString());
console.log(future.getTime());

console.log(new Date(2142274980000));

console.log(Date.now());

future.setFullYear(2040);
console.log(future);

const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

const calcDaysPassed = (date, date1) =>
    Math.abs(date1 - date) / (1000 * 60 * 60 * 24);

const days1 = calcDaysPassed(new Date(2037, 3, 14), new Date(2037, 3, 24));
console.log(days1);

const num = 3884764.23;

const options = {
    style: 'currency',
    unit: 'celsius',
    currency: 'EUR',
    // useGrouping: false,
};

console.log('US      :', new Intl.NumberFormat('en-US', options).format(num));
console.log('GERMANY :', new Intl.NumberFormat('de-DE', options).format(num));
console.log('SYRIA   :', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
    'BROWSER :',
    new Intl.NumberFormat(navigator.language, options).format(num)
);

// setTimeout
const ingredients = ['pineapple', 'ham'];

const pizzaTimer = setTimeout(
    (ing1, ing2) =>
        console.log(`Here is your ${ingredients.join(' and ')} pizza 🍕`),
    3000,
    ...ingredients
);
console.log('Waiting...');

if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// setInterval
const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
    second: 'numeric',
    // weekday: 'long',
};
const locale = navigator.language;

setInterval(function () {
    const now = new Date();
    console.log(new Intl.DateTimeFormat(`${locale}`, options).format(now));
}, 1000);
*/
