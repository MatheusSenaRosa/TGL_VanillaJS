import { rgba, shade } from "polished";

import { Type, ICart } from "./interfaces";
import { getGamesData } from "./services";
import { getAllByDataJs, getByDataJs } from "./utils";

(() => {
  let selectedGame: Type;
  let gamesData: Type[] = [];
  let selectedNumbers: string[] = [];
  let cart: ICart[] = [];

  // *********************************** Style Functions ***********************************

  const setNumericButtonStyles = (
    button: HTMLButtonElement,
    type: "active" | "inactive"
  ) => {
    switch (type) {
      case "inactive":
        button.style.background = "#ADC0C4";

        button.onmouseover = () => {
          button.style.background = rgba(selectedGame.color, 0.6);
        };

        button.onmouseout = () => {
          button.style.background = "#ADC0C4";
        };
        break;

      case "active":
        button.style.background = selectedGame.color;

        button.onmouseover = null;

        button.onmouseout = null;
    }
  };

  const setGameButtonStyles = (
    button: HTMLButtonElement,
    color: string,
    type: "active" | "inactive"
  ) => {
    switch (type) {
      case "inactive":
        button.onmouseover = () => {
          button.style.color = "white";
          button.style.background = color;
        };

        button.onmouseout = () => {
          button.style.color = color;
          button.style.background = "white";
        };

        button.style.color = color;
        button.style.borderColor = color;
        button.style.background = "white";
        break;

      case "active":
        button.onmouseover = null;
        button.onmouseout = null;
        button.style.background = color;
        button.style.color = "white";
        button.style.borderColor = color;
    }
  };

  const setSaveButtonStyles = () => {
    const $saveButton = getByDataJs("save-button") as HTMLButtonElement;

    $saveButton.style.color = selectedGame.color;

    $saveButton.onmouseover = () => {
      $saveButton.style.backgroundColor = selectedGame.color;
      $saveButton.style.color = "white";
    };

    $saveButton.onmouseout = () => {
      $saveButton.style.backgroundColor = "white";
      $saveButton.style.color = selectedGame.color;
    };
  };

  const setActionButtonsStyles = () => {
    const $completeGameButton = getByDataJs(
      "complete-game"
    ) as HTMLButtonElement;
    const $clearGameButton = getByDataJs("clear-game") as HTMLButtonElement;
    const $addCartButton = getByDataJs("add-cart") as HTMLButtonElement;

    $completeGameButton.style.color = selectedGame.color;
    $completeGameButton.style.borderColor = selectedGame.color;

    $completeGameButton.onmouseover = () => {
      $completeGameButton.style.backgroundColor = selectedGame.color;
      $completeGameButton.style.color = "white";
    };

    $completeGameButton.onmouseout = () => {
      $completeGameButton.style.backgroundColor = "white";
      $completeGameButton.style.color = selectedGame.color;
    };

    $clearGameButton.style.color = selectedGame.color;
    $clearGameButton.style.borderColor = selectedGame.color;

    $clearGameButton.onmouseover = () => {
      $clearGameButton.style.backgroundColor = selectedGame.color;
      $clearGameButton.style.color = "white";
    };

    $clearGameButton.onmouseout = () => {
      $clearGameButton.style.backgroundColor = "white";
      $clearGameButton.style.color = selectedGame.color;
    };

    $addCartButton.style.backgroundColor = selectedGame.color;
    $addCartButton.style.borderColor = selectedGame.color;

    $addCartButton.onmouseover = () => {
      $addCartButton.style.backgroundColor = shade(0.2, selectedGame.color);
      $addCartButton.style.borderColor = shade(0.2, selectedGame.color);
    };

    $addCartButton.onmouseout = () => {
      $addCartButton.style.backgroundColor = selectedGame.color;
      $addCartButton.style.borderColor = selectedGame.color;
    };
  };

  // *********************************** On Click Functions ***********************************

  const onClickNumericButton = (button: HTMLButtonElement) => {
    const index = selectedNumbers.findIndex(
      (item) => item === button.textContent
    );

    if (index !== -1) {
      selectedNumbers.splice(index, 1);
      setNumericButtonStyles(button, "inactive");
      return;
    }

    if (selectedNumbers.length === selectedGame.min_and_max_number) {
      alert(
        `You can't select more than ${selectedGame.min_and_max_number} numbers.`
      );
      return;
    }

    setNumericButtonStyles(button, "active");
    selectedNumbers.push(button.textContent!);
  };

  const onClickGameButton = (button: HTMLButtonElement) => {
    const $gameDescription = getByDataJs("game-description");
    const $gameTitle = getByDataJs("game-title");

    const newSelectedGame = gamesData.find(
      (game) => game.type === button.textContent
    )!;

    resetGameButtons();

    selectedGame = newSelectedGame;
    selectedNumbers = [];
    $gameTitle.textContent = `FOR ${newSelectedGame.type.toUpperCase()}`;
    $gameDescription.textContent = newSelectedGame.description;

    setGameButtonStyles(button, newSelectedGame.color, "active");
    setActionButtonsStyles();
    setSaveButtonStyles();
    renderNumericButtons();
  };

  const onClickCompleteGameButton = () => {
    const newSelectedNumbers = [...selectedNumbers];
    const missing = selectedGame.min_and_max_number - newSelectedNumbers.length;

    for (let i = 1; i <= missing; i++) {
      const randomNumber = Math.ceil(Math.random() * selectedGame.range)
        .toString()
        .padStart(2, "0");

      const alreadyIncludes = newSelectedNumbers.some(
        (item) => item === randomNumber
      );

      if (alreadyIncludes) {
        i--;
        continue;
      }

      newSelectedNumbers.push(randomNumber);
    }

    const $numericButtons = getAllByDataJs(
      "numeric-button"
    ) as NodeListOf<HTMLButtonElement>;

    $numericButtons.forEach((button) => {
      const isIncluded = newSelectedNumbers.some(
        (item) => item === button.textContent
      );

      if (isIncluded) {
        setNumericButtonStyles(button, "active");
      }
    });

    selectedNumbers = [...newSelectedNumbers];
  };

  const onClickTrashButton = (cartItem: HTMLLIElement) => {
    const numbers = getByDataJs(
      "cart-item-numbers",
      cartItem
    ).textContent!.trim();

    const type = getByDataJs("cart-item-type", cartItem)
      .textContent?.trim()
      .split("R$")[0];

    const indexToRemove = cart.findIndex(
      (item) => formatBetNumbers(item.numbers) === numbers && item.type === type
    );

    cart.splice(indexToRemove, 1);
    cartItem.remove();
    renderTotalPrice();
    renderOrRemoveEmptyCartFeedback();
  };

  const onClickAddCartButton = () => {
    const alreadyExists = validateAlreadyExistsInCart();
    const missingNumbers =
      selectedGame.min_and_max_number - selectedNumbers.length;
    const newCartItem = {
      color: selectedGame.color,
      price: selectedGame.price,
      type: selectedGame.type,
      numbers: [...selectedNumbers],
    };

    if (missingNumbers) {
      alert(
        `You must select ${
          selectedGame.min_and_max_number
        } numbers. \n${missingNumbers} number${
          missingNumbers > 1 ? "s are" : " is"
        } missing.`
      );
      return;
    }

    if (alreadyExists) {
      alert("This bet already exists in your cart. Try a new bet.");
      return;
    }

    cart.unshift(newCartItem);
    renderNewCartItem(newCartItem);
    renderTotalPrice();
    clearGame();
    renderOrRemoveEmptyCartFeedback();
  };

  // *********************************** Render Functions ***********************************

  const renderNewCartItem = (newCartItem: ICart) => {
    const $cart = getByDataJs("cart");
    const $cartItemElement = document.createElement("li");
    $cartItemElement.setAttribute("data-js", "cart-item");

    const betNumbers = formatBetNumbers(newCartItem.numbers);
    const betPrice = formatPrice(newCartItem.price);

    $cartItemElement.innerHTML = `
    <span style="background-color: ${newCartItem.color}"></span>
    <div class="cart-item-data" >
      <p data-js="cart-item-numbers">
        ${betNumbers}
      </p>
      <h5 data-js="cart-item-type" style="color: ${newCartItem.color}">${newCartItem.type}<span>R$ ${betPrice}</span></h5>
    </div>
    `;

    $cartItemElement.insertAdjacentElement(
      "afterbegin",
      renderTrashButton($cartItemElement)
    );

    $cart.insertAdjacentElement("afterbegin", $cartItemElement);
  };

  const renderOrRemoveEmptyCartFeedback = () => {
    const $cart = getByDataJs("cart");

    if (cart.length) {
      const $emptyFeedback = getByDataJs("empty-feedback");
      $cart.className = "";
      $emptyFeedback.remove();
      return;
    }

    const $emptyFeedback = document.createElement("h3");

    $cart.className = "empty";
    $emptyFeedback.textContent = "Empty";
    $emptyFeedback.setAttribute("data-js", "empty-feedback");
    $cart.appendChild($emptyFeedback);
  };

  const renderNumericButtons = () => {
    const $numericContainer = getByDataJs("numeric-container");
    $numericContainer.innerHTML = "";

    for (let i = 1; i <= selectedGame.range; i++) {
      const $button = document.createElement("button");

      $button.textContent = String(i).padStart(2, "0");
      $button.setAttribute("data-js", "numeric-button");
      setNumericButtonStyles($button, "inactive");
      $button.addEventListener("click", () => onClickNumericButton($button));
      $numericContainer.appendChild($button);
    }
  };

  const renderGameButtons = () => {
    const $gameDescription = getByDataJs("game-description");
    const $gameTitle = getByDataJs("game-title");
    const $gameButtonsContainer = getByDataJs("game-buttons-container");

    gamesData.forEach((currentGame, index) => {
      const $button = document.createElement("button");
      $button.textContent = currentGame.type;
      $button.setAttribute("data-js", "game-button");

      if (index === 0) {
        setGameButtonStyles($button, currentGame.color, "active");
        $gameTitle.textContent = `FOR ${currentGame.type.toUpperCase()}`;
        $gameDescription.textContent = currentGame.description;
      } else {
        setGameButtonStyles($button, currentGame.color, "inactive");
      }

      $button.addEventListener("click", () => onClickGameButton($button));

      $gameButtonsContainer.appendChild($button);
    });
  };

  const renderTrashButton = (cartItem: HTMLLIElement) => {
    const $trashButton = document.createElement("button");
    $trashButton.setAttribute("data-js", "trash-button");
    $trashButton.className = "trash-button";
    $trashButton.innerHTML = `<i class="fa-solid fa-trash"></i>`;

    $trashButton.addEventListener("click", () => onClickTrashButton(cartItem));

    return $trashButton;
  };

  const renderTotalPrice = () => {
    const $totalElement = getByDataJs("total");
    const totalPrice = cart.reduce((acc, cur) => +cur.price + acc, 0);
    const formattedTotalPrice = formatPrice(totalPrice);
    $totalElement.textContent = `TOTAL R$ ${formattedTotalPrice}`;
  };

  const renderActionButtons = () => {
    const $addCartButton = getByDataJs("add-cart") as HTMLButtonElement;
    const $clearGameButton = getByDataJs("clear-game") as HTMLButtonElement;
    const $completeGameButton = getByDataJs(
      "complete-game"
    ) as HTMLButtonElement;

    setActionButtonsStyles();

    $completeGameButton.addEventListener("click", onClickCompleteGameButton);
    $clearGameButton.addEventListener("click", clearGame);
    $addCartButton.addEventListener("click", () => onClickAddCartButton());
  };

  const renderSaveButton = () => {
    setSaveButtonStyles();
  };

  // *********************************** Formatation Functions ***********************************

  const formatBetNumbers = (numbers: string[]) => {
    const formatted = numbers
      .map((item) => +item)
      .sort((a, b) => a - b)
      .map((item) => String(item).padStart(2, "0"))
      .join(", ");

    return formatted;
  };

  const formatPrice = (price: number) => {
    const formatted = price.toFixed(2).replace(".", ",");

    return formatted;
  };

  // *********************************** General Functions ***********************************

  const stopLoading = () => {
    const $loading = getByDataJs("loading");
    const $mainContent = getByDataJs("mainContent");
    $loading.remove();
    $mainContent.className = "mainContent";
  };

  const resetGameButtons = () => {
    const allGameButtons = getAllByDataJs(
      "game-button"
    ) as NodeListOf<HTMLButtonElement>;

    allGameButtons.forEach((currentButton) => {
      const color = gamesData.find(
        (game) => game.type === currentButton.textContent
      )!.color;
      setGameButtonStyles(currentButton, color, "inactive");
    });
  };

  const clearGame = () => {
    const $numericButtons = getAllByDataJs(
      "numeric-button"
    ) as NodeListOf<HTMLButtonElement>;

    $numericButtons.forEach((button) => {
      setNumericButtonStyles(button, "inactive");
    });

    selectedNumbers = [];
  };

  const validateAlreadyExistsInCart = () => {
    const { type } = selectedGame;
    const numbers = formatBetNumbers(selectedNumbers);

    const alreadyExists = cart.some((item) => {
      const isSameType = item.type === type;
      const areSameNumbers = formatBetNumbers(item.numbers) === numbers;
      return isSameType && areSameNumbers;
    });

    return alreadyExists;
  };

  const initApp = async () => {
    const data = await getGamesData();
    gamesData = data.types;
    selectedGame = data.types[0];

    stopLoading();

    renderGameButtons();
    renderNumericButtons();
    renderActionButtons();
    renderSaveButton();
    renderOrRemoveEmptyCartFeedback();
    renderTotalPrice();
  };

  initApp();
})();
