import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import axios from 'axios';

const lightbox = new SimpleLightbox('.gallery a');

let currentPage = 1;
let totalPages = 1;
let isLoading = false;

document
  .getElementById('search-form')
  .addEventListener('submit', async function (event) {
    event.preventDefault();

    const searchQuery = this.elements.searchQuery.value.trim();

    if (searchQuery === '') {
      Notiflix.Notify.failure('Please enter a search query.');
      return;
    }

    document.querySelector('.gallery').innerHTML = '';
    currentPage = 1;

    await fetchImages(searchQuery);

    Notiflix.Notify.success(`Hooray! We found ${totalPages * 40} images.`);

    document.querySelector('.load-more').style.display =
      totalPages > 1 ? 'block' : 'none';

    const observer = new IntersectionObserver(async entries => {
      if (entries[0].isIntersecting && !isLoading && currentPage < totalPages) {
        isLoading = true;
        currentPage++;
        await fetchImages(searchQuery);
        isLoading = false;
      }
    });

    observer.observe(document.querySelector('.load-more'));
  });

document
  .querySelector('.load-more')
  .addEventListener('click', async function () {
    if (currentPage < totalPages) {
      currentPage++;
      await fetchImages(
        document.getElementById('search-form').elements.searchQuery.value.trim()
      );
    } else {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      this.style.display = 'none';
    }
  });

async function fetchImages(searchQuery) {
  const apiKey = '42199315-7de7e6efccfebdf69232db3cd';
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.hits.length === 0) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      totalPages = Math.ceil(data.totalHits / 40);

      renderImageCards(data.hits);

      const { height: cardHeight } = document
        .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();
      window.scrollBy({
        top: cardHeight * 2,
        behavior: 'smooth',
      });

      lightbox.refresh();
    }
  } catch (error) {
    console.error('Error fetching images:', error);
  }
}

function renderImageCards(images) {
  const gallery = document.querySelector('.gallery');

  images.forEach(image => {
    const photoCard = document.createElement('div');
    photoCard.classList.add('photo-card');

    const imageLink = document.createElement('a');
    imageLink.href = image.largeImageURL;

    const img = document.createElement('img');
    img.src = image.webformatURL;
    img.alt = image.tags;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.classList.add('info');

    ['Likes', 'Views', 'Comments', 'Downloads'].forEach(key => {
      const infoItem = document.createElement('p');
      infoItem.classList.add('info-item');
      infoItem.innerHTML = `<b>${key}</b>: ${image[key.toLowerCase()] || 0}`;
      info.appendChild(infoItem);
    });

    imageLink.appendChild(img);
    photoCard.appendChild(imageLink);
    photoCard.appendChild(info);

    gallery.appendChild(photoCard);
  });
}
document.querySelector('.load-more').style.display = 'none';
