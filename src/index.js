import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const API_KEY = "39914806-2f3555676b3ba657a337df35e";
const BASE_URL = "https://pixabay.com/api/";

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

searchForm.addEventListener('submit', onSearch);

let query = '';
let page = 1;
let simpleLightBox = new SimpleLightbox('.gallery');
let allPagesLoaded = false;
let perPage = 40;

function onSearch(e) {
    e.preventDefault();

    page = 1;
    query = e.currentTarget.elements.searchQuery.value.trim();
    allPagesLoaded = false;
    gallery.innerHTML = '';

    fetchImages(query, page, perPage).then(data => {
        if (data.totalHits === 0) {
            Notiflix.Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.',
            );
        } else {
            cardMarcup(data.hits);
            const totalPages = Math.ceil(data.totalHits / perPage);

            if (page == totalPages) {
                allPagesLoaded = true;
            }
            simpleLightBox.refresh();
            Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);
        }
    })
    .catch(error => console.log(error))
    .finally(() => {
        searchForm.reset();
    });
}

function cardMarcup(images) {
    if (!gallery) {
        return;
    }
    const markup = images.map(image => {
        const { id, webformatURL, tags, likes, views, comments, downloads, } = image;
        return `
        <div class="photo-card" id="${id}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
        </div>`;
    }).join('');

    gallery.insertAdjacentHTML('beforeend', markup);
}

function onLoad() {
    if (allPagesLoaded) {
        return;
    }
    page += 1;
    loadMoreBtn.hidden = true;
    Notiflix.Loading.circle('Loading...');

    fetchImages(query, page, perPage).then(data => {
        if (data.hits.length === 0) {
            allPagesLoaded = true;
        } else {
            cardMarcup(data.hits);
            simpleLightbox.refresh();

            const totalPages = Math.ceil(data.totalHits / perPage);

            if (page == totalPages) {
                allPagesLoaded = true;
                Notiflix.Notify.failure(
                    "We're sorry, but you've reached the end of search results.",
                );
            }
        }
    }).catch(error => console.log(error));
}
function checkEndOfPage() {
    return (
        window.innerHeight + window.scrolly >= document.documentElement.scrollHeight
    );
}
function showLoadMorePage() {
    if (checkEndOfPage()) {
        onLoad();
    }
}

window.addEventListener('scroll', showLoadMorePage);

async function fetchImages(query) {
    const params = new URLSearchParams({
        key: API_KEY,
        q: query,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        page: page,
        per_page: perPage,
    })

    const response = await axios.get(`${BASE_URL}?${params}`);
    console.log(response);
return response.data;
}
