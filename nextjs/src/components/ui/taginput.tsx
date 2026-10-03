import { useState, useRef, useEffect, KeyboardEvent, MouseEvent, ChangeEvent } from "react"
import { X } from "lucide-react"

interface TagInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  availableTags?: string[]
  label?: string
  className?: string
}

export default function TagInput({ 
  value, 
  onChange,
  placeholder,
  availableTags = [],
  label,
  className = ""
}: TagInputProps) {
  const [inputValue, setInputValue] = useState<string>("")
  const [tags, setTags] = useState<string[]>(value ? value.split(',').filter(tag => tag.trim()) : [])
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([])
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState<number>(0)
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    onChange(tags.join(','))
  }, [tags, onChange])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | any) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (inputValue.trim() === "") {
      setFilteredSuggestions([])
      setShowSuggestions(false)
      return
    }
    
    const filtered = availableTags
      .filter(tag => tag.toLowerCase().includes(inputValue.toLowerCase()))
      .filter(tag => !tags.includes(tag))
    
    setFilteredSuggestions(filtered)
    setShowSuggestions(filtered.length > 0)
    setActiveSuggestionIndex(0)
  }, [inputValue, availableTags, tags])

  const addTag = (tag: string): void => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setInputValue("")
    }
  }

  const removeTag = (tagToRemove: string): void => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      
      if (showSuggestions && filteredSuggestions.length > 0) {
        const selectedSuggestion = filteredSuggestions[activeSuggestionIndex]
        if (selectedSuggestion) {
          addTag(selectedSuggestion)
        }
      } else if (inputValue.trim()) {
        addTag(inputValue)
      }
    } 
    else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      const lastTag = tags[tags.length - 1];
      if (lastTag) {
        removeTag(lastTag)
      }
    }
    else if (e.key === "ArrowDown" && showSuggestions) {
      e.preventDefault()
      setActiveSuggestionIndex(prevIndex => 
        prevIndex < filteredSuggestions.length - 1 ? prevIndex + 1 : 0
      )
    }
    else if (e.key === "ArrowUp" && showSuggestions) {
      e.preventDefault()
      setActiveSuggestionIndex(prevIndex => 
        prevIndex > 0 ? prevIndex - 1 : filteredSuggestions.length - 1
      )
    }
    else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  return (
    <div className={`${className} w-full relative`}>
      {label && <div className="text-sm font-medium mb-2">{label}</div>}
      
      <div className="flex flex-wrap items-center gap-2 p-2 rounded-md border border-input bg-background focus-within:ring-1 focus-within:ring-ring min-h-10">
        {tags.map((tag, index) => (
          <div 
            key={index} 
            className="flex items-center gap-1 bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-100 px-2 py-0.5 rounded-md text-sm"
          >
            <span>{tag}</span>
            <button 
              type="button" 
              onClick={() => removeTag(tag)}
              className="text-teal-600 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onClick={() => inputValue && setShowSuggestions(true)}
          onFocus={() => inputValue && setShowSuggestions(true)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 bg-transparent border-none outline-none p-0 text-sm min-w-20"
        />
      </div>
      
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto"
        >
          {filteredSuggestions.length > 0 ? (
            <ul className="py-1">
              {filteredSuggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => {
                    addTag(suggestion)
                    setShowSuggestions(false)
                  }}
                  className={`px-3 py-2 text-sm cursor-pointer ${
                    index === activeSuggestionIndex
                      ? "bg-teal-100 dark:bg-teal-800 text-teal-800 dark:text-teal-100"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </div>
  )
}