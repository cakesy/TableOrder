import {initializeBlock,useBase,useRecords, FieldPickerSynced, useGlobalConfig,  TablePickerSynced, expandRecord, useWatchable,
    ViewPickerSynced, Button,
    Label, Box,Input,useSynced,
    FormField,
    TextButton} from '@airtable/blocks/ui';

import React, { useEffect, useState } from 'react';

import {settingsButton} from '@airtable/blocks';

const GlobalConfigKeys = {
    TABLE_ID: 'tableId',
    VIEW_ID: 'viewId',
    X_FIELD_ID: 'xFieldId',
};



function HelloWorldBlock(shouldShowSettingsButton) {

    
	const base = useBase();
	const globalConfig = useGlobalConfig();
    const tableId = globalConfig.get('selectedTableId');
	
	const table = base.getTableByIdIfExists(tableId);
	
	const [tableSize, settableSize] =  useState("4");
   
   
	const records = useRecords(table);
	const tasks = records.map(record => {
		
        return (
            <div key={record.id}>
                {record.name +', '+record.getCellValueAsString('Table')}
            </div>
        );
    });
    
    var errorMessage = "";
    
    return (
        <div>
            <Box  padding={2} >
					<FormField label="Table" >
						<TablePickerSynced globalConfigKey={GlobalConfigKeys.TABLE_ID} />
					</FormField>
				{table && (
					<Box  >
					<Label htmlFor="Tablesize">Table size</Label>
				 	 <Input  id="Tablesize"  variant="primary"
						  value={tableSize}
						  onChange={e => settableSize(e.target.value)}
						  placeholder="Table Size"
						  
						/>
					</Box>
				)}
				{table && (
					<Box paddingTop={2} >
					   <Button onClick={() => { RunTableSet() }}
						icon="edit" id="clicktable">
						Process Guests
					  </Button>
					</Box>
				)}
				{table && (
					<Box  paddingTop={2} >
					<Label>{errorMessage}</Label>
					</Box>
				)}
			</Box>
        </div>
    );
    
    // process the table
	function RunTableSet() {

		const toggle = (record) => {
			table.updateRecordAsync(
				record, {[completedFieldId]: !record.getCellValue(completedFieldId)}
			);
		};
	
   
   	  console.log('tableSize '+tableSize);
   
       //possible tables
	   var TableFull = new Array(100);
   
       // empty all tables
	   for (var i = 0; i < TableFull.length; i++) { 
		  TableFull[i]=0;
	   }
	
	   //check for any priority seating.
		records.map(record => {
			if (record.getCellValueAsString('Table').length>0){
			
				// if field has the word table, remove it
				var tableNo=record.getCellValueAsString('Table');
				if (tableNo.substring(0,6)==="Table "){
					tableNo=tableNo.substring(5,8);
				} else {
					
				}
				
				TableFull[parseInt(tableNo)-1]++;
				if (TableFull[parseInt(tableNo)-1]>tableSize){
					console.log("Table "+(parseInt(tableNo)-1)+" is over capacity of "+tableSize);
					errorMessage=errorMessage+"Table "+(parseInt(tableNo))+" is over capacity of "+tableSize+"\n";
				}
			}
		});
		
	    //starting from 0, assign the rest of users to tables
	    var tableCheckNo=0;
		records.map(record => {
		
			//if not already assigned to a table
			if (record.getCellValueAsString('Table').length==0){
				
	    		
				// get the next available table
				while (TableFull[tableCheckNo]>=tableSize){
						tableCheckNo++;
						console.log("  --- add "+tableCheckNo)
				}
			
				// assign guest to this table
				TableFull[tableCheckNo]++;
				var value="Table " + (tableCheckNo+1);
				table.updateRecordAsync(record, {"Table": value } );
			}
		});
	
		if (errorMessage.length>0){
			alert("Error: "+errorMessage);
		}
	}	
}


initializeBlock(() => <HelloWorldBlock />);
