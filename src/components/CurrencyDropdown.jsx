import React from 'react'
import { HiOutlineStar, HiStar } from "react-icons/hi";

const CurrencyDropdown = ({
  currencies, 
  currency,
  setCurrency, 
  favorites,
  handleFavorite, 
  title=""}) => {
    const isFavorite = curr => favorites.includes(curr)
  return (
    <div>
      <label htmlFor={title} className="block text-sm font-medium text-gray-700">{title}</label>

      <div className="mt-1 relative ">
        <select value={currency} onChange={(e=>{setCurrency(e.target.value)})}className= "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" >
          {favorites?.map((currency, key)=> <option className="bg-gray-200" value={currency} key={key}>{currency}</option>)}
          <hr />
          { currencies .filter(c =>!favorites.includes(c)).map((currency, key)=> <option value={currency} key={key}>{currency}</option>)}
        </select>
        <button onClick= {()=>handleFavorite(currency)}className='absolute inset-y-0 pr-5 flex items-center text-sm leading-5'> {isFavorite(currency)? <HiStar /> :<HiOutlineStar />}</button>
      </div>
    </div>
  )
}

export default CurrencyDropdown;