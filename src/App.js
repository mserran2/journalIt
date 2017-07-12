import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import $ from 'jquery'
import Moment from 'react-moment'

class JournalEntry extends Component {
    render(){
        return (
            <div className="journal-entry">
                <h1></h1>
                <Moment>{this.props.date_time*1000}</Moment>
                <div>{this.props.entry}</div>
                <div>{this.props.mood}</div>
            </div>
        )
    }
}

class JournalEntryForm extends Component{
    render(){
        return (<form className="journal-entry-form" onSubmit={this._handleSubmit.bind(this)}>
            <label>Add an entry</label>
            <div className="journal-entry-form-fields">
                <input placeholder="Mood:" ref={(input) => this._mood = input} />
                <textarea placeholder="Entry:" ref={(input) => this._entry = input}></textarea>
            </div>
            <div className="journal-entry-form-actions">
                <button type="submit">
                    Post Entry
                </button>
            </div>
        </form>)
    }

    _handleSubmit(event){
        event.preventDefault();
        let date_time = (new Date().getTime()) / 1000;
        let mood = this._mood;
        let entry = this._entry
        this.props.addEntry(date_time, mood.value, entry.value);
    }
}

class JournalEntryBox extends Component {
    componentWillMount(){
        this._fetchEntries();
    }

    componentDidMount(){
        setInterval( () => {
            //this._fetchEntries();
        }, 3000)
    }
    constructor() {
        super();

        this.state = {
            entries: []
        };
    }

    _fetchEntries(){
        $.ajax({
            method: 'GET',
            url: 'http://192.168.29.101:8080/journal_entries',
            success: (entries) => {
                this.setState({ entries });
            }
        });
    }



    _getJournalEntriesTitle(entries){
        switch(entries.length){
            case 0:
                return "No entries"
            case 1:
                return "1 journal entry"
            default:
                return entries.length + " journal entries"
        }
    }
    _getJournalEntries(){
        return this.state.entries.map((entry) => {
            return (<JournalEntry key={entry.id} date_time={entry.date_time} entry={entry.entry} mood={entry.mood}  /> )
        })
    }

    _addEntry(date_time,mood, entry){
        const post = {
            date_time,
            mood,
            entry
        };
        this._postEntry(post).done((data) => {
            this.setState({entries: this.state.entries.concat([data])});
        })
    }

    _postEntry(entry){
       return $.ajax({
            method: 'POST',
            url: 'http://192.168.29.101:8080/journal_entries',
            data: entry
        });
    }

    render(){
        const entries = this._getJournalEntries()
        return (
            <div className="journal-box">
                <h1>{this._getJournalEntriesTitle(entries)}</h1>
                <JournalEntryForm addEntry={this._addEntry.bind(this) } />
                <div className="journal-list">
                    {entries}
                </div>
            </div>
        )
    }
}


class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2>Welcome to Journaling</h2>
        </div>
        <JournalEntryBox/>
      </div>
    );
  }
}

export default App;
