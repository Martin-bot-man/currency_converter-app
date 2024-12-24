import React from 'react'
import {useState, useEffect} from 'react';
import CurrencyDropdown from './CurrencyDropdown';
import { HiArrowsRightLeft } from "react-icons/hi2";


const CurrencyConverter = () => {
    const[currencies, setCurrencies]= useState([]);
    const[amount, setAmount] = useState(1);
    const[fromCurrency, setFromCurrency]= useState('USD');
    const[toCurrency, settoCurrency] = useState('INR');
    const[convertedAmount, setConvertedAmount]= useState(null);
    const[converting, setCoverting] = useState(false);
    const [favorites, setFavorites] = useState(
        JSON.parse(localStorage.getItem("favorites")) || ["INR", "EUR"] 
      );

    // currencies="https://api.frankfurter.app/currencies"
    const  fetchCurrencies = async()=>{
        try{
            const res = await fetch("https://api.frankfurter.app/currencies");
            const data= await res.json()

            setCurrencies(Object.keys(data))
            console.log(data);

        }catch(error){
            console.error('Error fetching', error);

        }
    }
    useEffect(()=>{
        console.log("use effect is running")
        console.log(fetchCurrencies())

    },[])
    console.log(currencies);


    const ConvertCurrency= async()=>{
        if(!amount) return
        setCoverting(true);


        try{
            const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}from=${fromCurrency}&to=${toCurrency}`);
            const data= await res.json();

            setConvertedAmount(data.rates[toCurrency]+ ""+ toCurrency);


        }
        catch(error){
            console.error("Error fetching", error)

        }finally{
            setCoverting(false);

        }


    };
    const handleFavorite =(currency)=>{
        let updatedFavorites = [...favorites];
        if(favorites.includes(currency)){
            updatedFavorites = updatedFavorites.filter((fav)=>fav!==currency);

        }else{
            updatedFavorites.push(currency);
        }
        setFavorites(updatedFavorites)
        localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
        //add to favoriters

    }
    const swapCurrencies=()=>{
        setFromCurrency(toCurrency)
        settoCurrency(fromCurrency)

    }

    //currencies = 'https://api.frankfurter.app/latest?amount=1&from=USD&to=INR';

  return(
     <div className="max-w-xl mx-auto my-10 p-5 bg-white-600 rounded-lg shadow-md">
        <h2 className="mb-5 text-2xl font-semibold text-gray-700">Currency converter</h2>
       
        <div  className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <CurrencyDropdown 
            currencies={currencies}
            favorites={favorites} 
            currency ={fromCurrency}
            setCurrency={setFromCurrency}
            title='From:'
            handleFavorite={handleFavorite}
             />
             <div className="flex justify-center -mb-5 sm:mb-0">
                <button onClick={swapCurrencies} className="p-2 bg-200 rounded-full cursor-pointer hover:bg-gray-300"><HiArrowsRightLeft  className="text-xl text-gray-700"/></button>
             </div>
            <CurrencyDropdown 
            currencies={currencies} 
            favorites={favorites}
            setCurrency={settoCurrency}
            title='To :'
            handleFavorite= {handleFavorite}/>
        </div>

        <div mt-4>
            <label htmlFor="amount" className='block text-sm font-medium text-gray-700'> Amount</label>
            <input type="number"  onChange={(e)=> setAmount(e.target.value)} value={amount} className='w-full p-2 border-gray-300 rounded-md shadow-sm focus:outline-none  focus:ring-2 focus:ring-indigo-500 mt-1'/>
        </div>
        <div className="flex justify-end mt-6 ">
            <button onClick={ConvertCurrency} className ={`px-5 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${converting? "animate-pulse":""}`}>Convert</button>
        </div>
        {convertedAmount && (
        <div className="mt-4 text-lg font-medium text-right text-green-600">Converted Amount: {convertedAmount}</div>)}
    </div>
  )
}

export default CurrencyConverter