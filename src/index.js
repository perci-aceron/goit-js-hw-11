import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

const apiKey = '42199315-7de7e6efccfebdf69232db3cd';
const perPage = 40;
let currentPage = 1;

form.addEventListener('submit', async function (event) {
  event.preventDefault();

  const searchQuery = event.target.searchQuery.value.trim();

  if (searchQuery) {
    clearGallery();
    currentPage = 1;
    await performSearch(searchQuery);
  }
});

loadMoreBtn.addEventListener('click', async function () {
  const searchQuery = form.searchQuery.value.trim();
  if (searchQuery) {
    currentPage++;
    await performSearch(searchQuery);
  }
});

async function performSearch(searchQuery) {
  try {
    const response = await axios.get('https://pixabay.com/api/', {
      params: {
        key: apiKey,
        q: searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page: currentPage,
        per_page: perPage,
      },
    });

    const { hits, totalHits } = response.data;

    if (hits.length > 0) {
      displayImages(hits);

      if (currentPage === 1) {
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
      }

      if (hits.length < perPage) {
        loadMoreBtn.style.display = 'none';
        Notiflix.Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      } else {
        loadMoreBtn.style.display = 'block';
      }

      scrollPage();
    } else {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }
  } catch (error) {
    console.error('Error fetching images:', error.message);
  }
}

function displayImages(images) {
  const fragment = document.createDocumentFragment();

  images.forEach(image => {
    const card = createImageCard(image);
    fragment.appendChild(card);
  });

  gallery.appendChild(fragment);

  const lightbox = new SimpleLightbox('.gallery a');
  lightbox.refresh();
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.className = 'photo-card';

  const link = document.createElement('a');
  link.href = image.largeImageURL;

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.className = 'info';

  ['Likes', 'Views', 'Comments', 'Downloads'].forEach(key => {
    const infoItem = document.createElement('p');
    infoItem.className = 'info-item';
    infoItem.innerHTML = `<b>${key}</b>: ${image[key.toLowerCase()] || 0}`;
    info.appendChild(infoItem);
  });

  link.appendChild(img);
  card.appendChild(link);
  card.appendChild(info);

  return card;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function scrollPage() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: 0,
    behavior: 'smooth',
  });
}

