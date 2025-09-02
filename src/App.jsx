import React, { useState,useEffect } from 'react'
import Search from './Components/Search'
import Spinner from './Components/Spinner';
import MovieCard from './Components/MovieCard';
import { getTrendingMovies, updateSearchCount } from './appwrite.js'

const API_BASE_URL='https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const API_OPTION = {
  method : 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  // const [debouncedSearchTerm] = useDebounce(searchTerm, 500);
  const [errorMessage, setErrorMessage]=useState('');
  const [movieList,setMovieList]=useState([]);
  const [trendingMovies, setTrendingMovies]=useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMovies = async (query='') => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTION);

      if (!response.ok) {
        throw new Error('failed to fetch movie');
      }

      const data = await response.json();
      
      if (data.results && Array.isArray(data.results)) {
        setMovieList(data.results);
      } else {
        setErrorMessage('No movies found');
        setMovieList([]);
        return;
      }
      if(query && data.results.length>0){
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

const loadTrendingMovies = async()=>{
   try{
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);
   }catch(error){
    console.error('Error loading trending movies:', error);
   }
}

  useEffect(() => {
    fetchMovies(searchTerm);
}, [searchTerm]);

  useEffect(()=>{
    loadTrendingMovies();
  },[])
  return (
    <main>
      <div className="pattern">

      </div>
      <div className="wrapper">
        <header>
          <img src='./hero-img.png' alt='hero image'/>
          <h1>
            Find <span className='text-gradient'>Movies</span> You'll Enjoy Without the Hassle
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>
        {trendingMovies.length>0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>
            <ul>
              {trendingMovies.map((movie,index)=>(
                <li key={movie.$id}>
                  <p>{index+1}</p>
                  <img src={movie.poster_url} alt='poster'/>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2 className='mt-[40px]'>All Movies</h2>
          {isLoading ? (
            <Spinner className="spinner"/>
          ) : errorMessage? (
            <p className='text-red-500'>{errorMessage}</p>
          ):(
            <ul>
              {movieList.map((movie)=>(
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}

export default App
