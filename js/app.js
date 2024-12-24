const levelLabe = document.getElementById("level-label");
const guessCountLabel = document.getElementById("guess-count-label");
let matrixSize = 4;
let maxSize = 10;
let attempts = 3;
let currentAttempts = attempts;
let gameMatrix = [];
let currentLevel = 1;
let getRandomNumber = () => Math.floor(Math.random() * 99);

function createMatrix(size) {
  gameMatrix = Array.from({ length: size }, () => Array.from({ length: size }, getRandomNumber));
}

function renderMatrix() {
  let container = document.getElementById("game-container");
  container.innerHTML = "";
  container.style.gridTemplateColumns = `repeat(${matrixSize}, 1fr)`;

  gameMatrix.flat().forEach((value, index) => {
    let row = Math.floor(index / matrixSize);
    let col = index % matrixSize;

    let div = document.createElement("div");
    div.textContent = value;
    div.classList.add("matrix-cell");
    div.dataset.row = row;
    div.dataset.col = col;
    div.addEventListener("click", () => handleCellClick(row, col));
    container.appendChild(div);
  });

  updateStatusDisplay();
}

let selectedCells = [];

function handleCellClick(row, col) {
  let cellElement = document.querySelector(`[data-row='${row}'][data-col='${col}']`);
  let cellIndex = selectedCells.findIndex((cell) => cell.row === row && cell.col === col);

  if (cellIndex !== -1) {
    selectedCells.splice(cellIndex, 1);
    cellElement.classList.remove("selected");
    return;
  }

  selectedCells.push({ row, col });
  cellElement.classList.add("selected");

  if (selectedCells.length === 4) {
    if (isValidSelection()) {
      let result = calculateProduct();
      if (isWinningCombination(result)) {
        iziToast.success({
          rtl: true,
          title: "تبریک",
          message: "آفرین، برنده شدی! رفتی مرحله بعد",
          position: "topRight",
        });
        nextLevel();
      } else {
        currentAttempts--;
        updateStatusDisplay();
        if (currentAttempts > 0) {
          iziToast.error({
            rtl: true,
            title: "اشتباه",
            message: `حدس اشتباه! شانس‌های باقی‌مانده: ${currentAttempts}`,
            position: "topRight",
          });
          resetSelection();
        } else {
          iziToast.error({
            rtl: true,
            title: "باختی",
            message: "متاسفانه باختی! بازی از اول شروع شد.",
            position: "topRight",
          });
          restartGame();
        }
      }
    } else {
      iziToast.warning({
        rtl: true,
        title: "هشدار",
        message: "انتخاب نامعتبر است. فقط 4 خانه‌ی متوالی افقی، عمودی یا مورب مجاز است.",
        position: "topRight",
      });
      resetSelection();
    }
  }
}

function isValidSelection() {
  let rows = selectedCells.map((cell) => cell.row);
  let cols = selectedCells.map((cell) => cell.col);

  let isHorizontal = rows.every((r) => r === rows[0]) && isConsecutive(cols);
  let isVertical = cols.every((c) => c === cols[0]) && isConsecutive(rows);
  let isDiagonal = isDiagonalSelection(rows, cols);

  return isHorizontal || isVertical || isDiagonal;
}

function isConsecutive(arr) {
  let sorted = [...arr].sort((a, b) => a - b);
  return sorted.slice(1).every((v, i) => v === sorted[i] + 1);
}

function isDiagonalSelection(rows, cols) {
  let sortedRows = [...rows].sort((a, b) => a - b);
  let sortedCols = [...cols].sort((a, b) => a - b);

  let diffRow = sortedRows[1] - sortedRows[0];
  let diffCol = sortedCols[1] - sortedCols[0];

  return diffRow === diffCol && isConsecutive(sortedRows) && isConsecutive(sortedCols);
}

function calculateProduct() {
  return selectedCells.reduce((product, cell) => product * gameMatrix[cell.row][cell.col], 1);
}

function isWinningCombination(result) {
  let maxProduct = -Infinity;

  for (let i = 0; i < gameMatrix.length; i++) {
    for (let j = 0; j < gameMatrix.length - 3; j++) {
      maxProduct = Math.max(maxProduct, gameMatrix[i][j] * gameMatrix[i][j + 1] * gameMatrix[i][j + 2] * gameMatrix[i][j + 3]);
    }
  }

  for (let i = 0; i < gameMatrix.length - 3; i++) {
    for (let j = 0; j < gameMatrix.length; j++) {
      maxProduct = Math.max(maxProduct, gameMatrix[i][j] * gameMatrix[i + 1][j] * gameMatrix[i + 2][j] * gameMatrix[i + 3][j]);
    }
  }

  for (let i = 0; i < gameMatrix.length - 3; i++) {
    for (let j = 0; j < gameMatrix.length - 3; j++) {
      maxProduct = Math.max(maxProduct, gameMatrix[i][j] * gameMatrix[i + 1][j + 1] * gameMatrix[i + 2][j + 2] * gameMatrix[i + 3][j + 3]);
    }
  }

  return result === maxProduct;
}

function nextLevel() {
  if (matrixSize < maxSize) {
    matrixSize++;
    currentAttempts = attempts;
    currentLevel++;
    createMatrix(matrixSize);
    renderMatrix();
    resetSelection();
    updateStatusDisplay();
  } else {
    iziToast.success({
      rtl: true,
      title: "تبریک",
      message: "تمام مراحل بازی را با موفقیت تمام کردی!",
      position: "topRight",
    });
    restartGame();
  }
}

function restartGame() {
  matrixSize = 4;
  currentAttempts = attempts;
  currentLevel = 1;
  createMatrix(matrixSize);
  renderMatrix();
  resetSelection();
  updateStatusDisplay();
}

function resetSelection() {
  selectedCells = [];
  document.querySelectorAll(".matrix-cell.selected").forEach((cell) => {
    cell.classList.remove("selected");
  });
}

function updateStatusDisplay() {
  let statusContainer = document.getElementById("status-container");
  // statusContainer.textContent = `سطح: ${currentLevel} (●'◡'●) شانس باقی مانده: ${currentAttempts}`;
  levelLabe.innerHTML = `مرحله: ${currentLevel}`;
  guessCountLabel.innerHTML = `شانس های باقی مانده: ${currentAttempts}`;
}

window.onload = function () {
  createMatrix(matrixSize);
  renderMatrix();
};
