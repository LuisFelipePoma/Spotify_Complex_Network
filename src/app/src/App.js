import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import Graph from './Graph';
import Loading from './components/Loading';
import './App.css';
function getArtistName(name) {
    return name.replace(/_/g, ' ');
}
const App = () => {
    const [nodeArtist, setNodeArtist] = useState(null);
    const [nodeHover, setNodeHover] = useState(null);
    const [artistIndex, setArtistIndex] = useState({});
    const [artistNames, setArtistNames] = useState({});
    const [artistSearch, setArtistSearch] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => {
        fetch('/data/edges/ArtistW_index.json')
            .then(response => response.json())
            .then(data => setArtistIndex(data))
            .catch(error => console.error('Error fetching ArtistIndex:', error));
        fetch('/data/edges/ArtistW_name.json')
            .then(response => response.json())
            .then(data => setArtistNames(data))
            .catch(error => console.error('Error fetching ArtistIndex:', error));
    }, []);
    function handleSearch(e) {
        // setNodeSearch(e.target.value)
        const search = e.target.value.toLowerCase();
        if (search.trim() === '') {
            setArtistSearch([]);
            return;
        }
        // search all artist index that matches the search in artistNames and save the key and the value
        const artists = Object.keys(artistNames).filter(key => key.replace(/_/g, ' ').toLowerCase().includes(search));
        // map artist with the key
        const results = artists.map(artist => [artist, artistNames[artist]]);
        if (artistSearch) {
            setArtistSearch(results);
        }
    }
    function handleResult(artist) {
        setNodeArtist(artist);
    }
    return (_jsxs("main", { className: 'w-full h-[100vh] flex bg-accent relative text-light', children: [nodeArtist && (_jsxs("p", { className: 'absolute top-5 right-[40%] z-50 text-center select-none', children: ["Artista Seleccionado:", ' ', _jsx("span", { className: 'font-bold text-primary text-lg', children: getArtistName(artistIndex[nodeArtist]) })] })), isLoading && _jsx(Loading, {}), nodeHover && (
            // Center
            _jsxs("p", { className: 'absolute z-50 select-none top-5 right-5', children: ["Artist : ", _jsx("span", { children: getArtistName(artistIndex[nodeHover]) })] })), !isLoading && (_jsx(_Fragment, { children: _jsx("section", { className: 'top-5 left-5 z-50 w-[425px] select-none flex flex-col gap-3 absolute', children: _jsxs("search", { className: 'flex flex-col max-h-[800px] w-[400px] bg-accent/50 rounded-md backdrop-blur-sm', children: [_jsx("input", { type: 'text', className: 'min-h-[50px] text-lg border-gray border-l-2 rounded-sm px-2 py-1 outline-none focus:border-primary hover:border-primary\n                placeholder:text-gray transition-all duration-[1s] ease-in-out\n                ', placeholder: 'Ingresa tu artista ramita andre', onChange: handleSearch, disabled: isLoading }), _jsx("ul", { className: 'overflow-y-scroll flex flex-col gap-2 no-scrollbar', children: artistSearch.map(artist => (_jsx("li", { className: 'text-primary bg-dark/85 backdrop-blur-sm px-4 py-2 rounded-sm\n                    transition-all duration-100 ease-in-out cursor-pointer \n                    hover:font-bold hover:brightness-110 hover:border-r-2 border-primary\n                    ', onClick: () => {
                                        handleResult(artist[1]);
                                    }, children: artist[0].replace(/_/g, ' ') }, artist[1]))) })] }) }) })), _jsx("section", { className: 'w-full h-full relative z-10', children: _jsx("div", { className: 'relative w-full h-fullbg-accent  rounded-lg', children: _jsx(Graph, { SetIsLoading: setIsLoading, setNodeArtist: setNodeArtist, NodeArtist: nodeArtist, setNodeHover: setNodeHover }) }) })] }));
};
export default App;
