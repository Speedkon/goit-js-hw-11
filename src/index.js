import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import throttle  from "lodash.throttle";

const API_KEY = "39914806-2f3555676b3ba657a337df35e";
const BASE_URL = "https://pixabay.com/api/";

const searchForm = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

var simpleLightBox = new SimpleLightbox('.gallery a');
let query = '';
let page = 1;

searchForm.addEventListener("input", throttle(handleInput, 500));
searchForm.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener("click", onLoad);

function handleInput(e) {
    query = e.target.value;
}

function onSearch(e) {
    e.preventDefault();

    page = 1;
    gallery.innerHTML = '';
    loadMoreBtn.hidden = true;
    Notiflix.Loading.remove();

    fetchImages(query).then(({data: {hits, totalHits}})=> {
        if (hits.length === 0 || query.trim() === "") {
            Notiflix.Notify.failure(
                'Sorry, there are no images matching your search query. Please try again.');
            gallery.innerHTML = "";
            Notiflix.Loading.remove();
        } else {
            cardMarcup(hits);
            const totalPages = Math.ceil(totalHits / 40);

            if (page === totalPages) {
                loadMoreBtn.hidden = true;
            } else {
                loadMoreBtn.hidden = false;
            }
            Notiflix.Loading.remove();
            Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);
        }
    }).catch(error => console.log(error));
}

function onLoad() {
    page += 1;
    loadMoreBtn.hidden = true;
    Notiflix.Loading.circle('Loading...');

    fetchImages(query).then(({data: {hits, totalHits}}) => {
        cardMarcup(hits);
        const totalPages = Math.ceil(totalHits / 40);
        if (page === totalPages) {
            loadMoreBtn.hidden = true;
        } else {
            loadMoreBtn.hidden = false;
        }
        Notiflix.Loading.remove();
    }).catch(error => console.log(error));
}

async function fetchImages(query) {
    const params = new URLSearchParams({
        key: API_KEY,
        q: query,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        page: page,
        per_page: 40,
    })

    const response = await axios.get(`${BASE_URL}?${params}`);
    console.log(response);
return response;
}

function cardMarcup(arr) {
    const markup = arr.map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) => {
        return `
        <div class="photo-card">
            <div class="photo-wrap">
            <a class="gallery-link" href="${largeImageURL}">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a> 
            </div>  
            <div class="info">
                <p class="info-item"><b>Likes</b>${likes}</p>
                <p class="info-item"><b>Views</b>${views}</p>
                <p class="info-item"><b>Comments</b>${comments}</p>
                <p class="info-item"><b>Downloads</b>${downloads}</p>
            </div>
        </div>`;
    }).join('');

    gallery.insertAdjacentHTML('beforeend', markup);
    simpleLightBox.refresh();
}




