const termsContainer = document.getElementById('terms');

async function loadTerms() {
  const response = await fetch('../data/terms.json');
  const terms = await response.json();
  console.log(terms);
}

loadTerms();