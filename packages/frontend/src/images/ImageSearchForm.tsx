import React from "react";

interface IImageSearchFormProps {
    searchString: string;
    onSearchStringChange: (searchString: string) => void;
    onSearchRequested: () => void;
}

export function ImageSearchForm({
                                    searchString,
                                    onSearchStringChange,
                                    onSearchRequested
                                }: IImageSearchFormProps) {
    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault(); // Prevent the browser's default redirection behavior
        onSearchRequested();
    }

    return (
        <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
            <label>
                Search for images
                <input
                    name="searchQuery"
                    value={searchString}
                    onChange={(e) => onSearchStringChange(e.target.value)}
                    style={{ marginLeft: "0.5em", width: "100%", maxWidth: "20em" }}
                />
            </label>
            <input type="submit" value="Search" style={{ marginLeft: "0.5rem" }} />
        </form>
    );
}