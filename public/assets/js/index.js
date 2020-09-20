let transactions = [];
let myChart;
const transactionForm = createTransactionForm();
const transactionAPI = createTransactionAPI();
fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    transactions = data;
  });

createTransactionForm = () => {
  const nameEl = document.querySelector("#t-name");
  const amountEl = document.querySelector("#t-amount");
  const errorEl = document.querySelector(".form .error");

  const displayError = message => {
    errorEl.textContent = message;
  };
  const validation = () => {
    if (nameEl.value === "" || amountEl.value === "") {
      displayError("Missing Information");
      return false;
    } else {
      displayError("");
      return true;
    }
  };

  const transaction = () => {
    return {
      name: nameEl.value,
      value: amountEl.value,
      date: new Date().toISOString()
    };
  };

  const clearForm = () => {
    nameEl.value = "";
    amountEl.value = "";
    showError("");
  };

  return Object.freeze({ transaction, validation, clearForm, displayError });
};

createTransactionAPI = () => {
  const create = transaction => {
    return fetch("/api/transaction", {
      method: "POST",
      body: JSON.stringify(transaction),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json"
      }
    }).then(response => {
      return response.json();
    });
  };

  const fetchAll = () => {
    return fetch("/api/transaction").then(response => {
      return response.json();
    });
  };

  return Object.freeze({ create, fetchAll });
};

renderTransactionChart = () => {
  populateTotal();
  populateTable();
  populateChart();
};

initalizeTransactions = () => {
  transactionAPI.fetchAll().then(data => {
    transaction = data;
    renderTransactionChart();
  });
};

function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${transaction.name}</td>
      <td>${transaction.value}</td>
    `;

    tbody.appendChild(tr);
  });
}

function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Total Over Time",
          fill: true,
          backgroundColor: "#6666ff",
          data
        }
      ]
    }
  });
}

sendTransaction = isAdding => {
  if (!transactionForm.validation()) return;
  // Create a record
  const transaction = transactionForm.transaction();
  // condition for subtracting funds
  if (!isAdding) transaction.value *= -1;

  // Add to the beginning of current array
  transactions.unshift(transaction);

  // re-run logix to populate ui with new record.
  populateChart();
  populateTable();
  populateTotal();

  transactionAPI.create(transaction).then(data => {
    if (data.errors) {
      transactionForm.showError("Missing Information");
    } else {
      transactionForm.clear();
    }
  }).catch(() => {
    transactionForm.clear();
  });
};

document.querySelector("#add-btn").onclick = function () {
  sendTransaction(true);
};

document.querySelector("#sub-btn").onclick = function () {
  sendTransaction(false);
};
