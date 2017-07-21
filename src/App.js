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
                <Moment fromNow>{this.props.created_at}</Moment>
                <div>{this.props.deets}</div>
                <div>{this.props.mood}</div>
                <JournalEntryRemoveConfirmation onDelete={this._handleDelete.bind(this)} />
            </div>
        )
    }

    _handleDelete() {
        this.props.onDelete(this.props.id);
    }
}

class JournalEntryForm extends Component{
    render(){
        return (<form className="journal-entry-form" onSubmit={this._handleSubmit.bind(this)}>
            <label>Add an entry</label>
            <div className="journal-entry-form-fields">
                <input placeholder="Mood:" ref={(input) => this._mood = input} />
                <textarea placeholder="Deets:" ref={(input) => this._deets = input}></textarea>
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
        let mood = this._mood;
        let deets = this._deets
        this.props.addEntry(mood.value, deets.value);
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
            return (<JournalEntry
                        key={entry.id}
                        id={entry.id}
                        created_at={entry.createdAt}
                        deets={entry.deets}
                        mood={entry.mood}
                        onDelete={this._removeEntry.bind(this)}
            /> )
        })
    }

    _addEntry(mood, deets){
        const post = {
            mood,
            deets
        };
        this._postEntry(post).done((data) => {
           //data = JSON.parse(data);
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

    _removeEntry(entryID){
        const entries = this.state.entries.filter(
            entry => entry.id !== entryID
        );

        this._destroyEntry(entryID).done(() => {
            this.setState({ entries });
        });
    }

    _destroyEntry(entryID){
        return $.ajax({
            method: 'DELETE',
            url: `http://192.168.29.101:8080/journal_entries/${entryID}`,
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

class JournalEntryRemoveConfirmation extends React.Component {
    constructor() {
        super();

        this.state = {
            showConfirm: false
        };
    }

    render() {

        let confirmNode;

        if (this.state.showConfirm) {
            return (
                <span>
          <a href="" onClick={this._confirmDelete.bind(this)}>Yes </a> - or - <a href="" onClick={this._toggleConfirmMessage.bind(this)}> No</a>
        </span>
            );
        } else {
            confirmNode = <a href="" onClick={this._toggleConfirmMessage.bind(this)}>Delete entry?</a>;
        }

        return (
            <span>
        {confirmNode}
      </span>
        );
    }

    _toggleConfirmMessage(e) {
        e.preventDefault();

        this.setState({
            showConfirm: !this.state.showConfirm
        });

    }

    _confirmDelete(e) {
        e.preventDefault();
        this.props.onDelete();
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
