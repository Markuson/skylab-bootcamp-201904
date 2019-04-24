const Search = (() => {
    const literals = {
        en: {
            search: 'Search'
        },
        es: {
            search: 'Buscar'
        },
        ca: {
            search: 'Buscar'
        },
        ga: {
            search: 'Buscar'
        }
    }

    return function({lang, onSearch}) {


        const {search} = literals[lang]

        function handleSearch(e) {
            e.preventDefault()

            const query = e.target.query.value

            onSearch(query)
        }

        return <>
            <form onSubmit={handleSearch}>
                <input type="text" name="query" placeholder={search}/><button >{search}</button>
            </form>
        </>
    }
})()