*** Settings ***
Library  Browser    enable_presenter_mode=True

Resource  ./variables.robot


*** Keywords ***

Load Project
    [Documentation]
    ...    Open a new Robot Framework Browser window and navigate to the project
    New Browser    headless=False     timeout=60s
    New Context    viewport={'width': 1280, 'height': 800}
    New Page       ${FRONTEND_URL}

Attempt Login
    [Documentation]
    ...    Attempt to login with given credentials
    [Arguments]
    ...    ${username}=${TEST_USER}    
    ...    ${password}=${TEST_PASSWORD}    
    ...    ${url}=${FRONTEND_URL}
    
    Go To    ${url}

    Wait For Elements State    span:has-text("Login")

    Type Text    input#username    ${username}
    Type Secret  input#password    $password

    Click    button:has-text("Login")
    
    Check Logged In

Check Logged In
    [Documentation]
    ...    Check that the user is logged in (sidebar menu options are visible)
    Wait For Elements State    a:has-text("Home")
    Wait For Elements State    a[href="/profile"]
    Wait For Elements State    button[aria-label="logout"]

Logout
    [Documentation]
    ...    Log out of the application using the sidebar logout button
    Click    button[aria-label="logout"]
    Wait For Elements State    span:has-text("Login")

Attempt To Access Protected Route
    [Documentation]
    ...    Navigate directly to a protected route without an active session,
    ...    and expect to be redirected back to the login page
    [Arguments]
    ...    ${path}

    Go To    ${FRONTEND_URL}${path}
    Wait For Elements State    span:has-text("Login")

Load Project and Login
    [Documentation]
    ...    Start a browser session and login with the default user ${TEST_USER}
    Load Project
    Attempt Login

Go To Page
    [Documentation]
    ...    Navigate to a page available in the sidebar
    [Arguments]
    ...    ${page}
    
    Click    a:has-text("${page}")

Add New Device
    [Documentation]
    ...    Add a new device (must already be on the Devices page)
    [Arguments]
    ...    ${name}
    ...    ${serial}
    ...    ${type}
    ...    ${hw_type}
    ...    ${site}
    ...    ${group}
    ...    ${owner}
    ...    ${consumption}
    ...    ${ip}
    ...    ${port}

    Click    button:has-text("Add Device")

    Wait For Elements State    input[name="deviceName"]

    Fill Text    input[name="deviceName"]            ${name}
    Fill Text    input[name="deviceSlNo"]            ${serial}
    Fill Text    input[name="deviceType"]            ${type}
    Fill Text    input[name="hwType"]                ${hw_type}
    Fill Text    input[name="site"]                  ${site}
    Fill Text    input[name="group"]                 ${group}
    Fill Text    input[name="owner"]                 ${owner}
    Fill Text    input[name="consumptionPerHour"]    ${consumption}
    Fill Text    input[name="ip"]                    ${ip}
    Fill Text    input[name="port"]                  ${port}

    Click    div[aria-labelledby="connectivity-type-label"]
    Click    li:has-text("SSH")

    Fill Text    input[name="loginUser"]    admin
    Fill Text    input[name="password"]     admin123

    Click    button:has-text("Submit")

    Wait For Elements State    input[name="deviceName"]    hidden

Add Schedule
    [Documentation]
    ...    Configure a power schedule for a device (must already be on the Devices page)
    [Arguments]
    ...    ${name}
    ...    ${on_time}
    ...    ${off_time}
    ...    @{days}

    Click Device Option    ${name}    Schedule

    Wait For Elements State    text=Save Schedule

    Check Checkbox    input[type="checkbox"]

    Fill Text    input[type="time"] >> nth=0    ${on_time}
    Fill Text    input[type="time"] >> nth=1    ${off_time}

    FOR    ${day}    IN    @{days}
        Click    button:has-text("${day}")
    END

    Click    button:has-text("Save Schedule")

    Wait For Elements State    text=Save Schedule    hidden

Check Device Schedule
    [Documentation]
    ...    Reopen a device's schedule dialog and verify the configured schedule
    [Arguments]
    ...    ${name}
    ...    ${on_time}
    ...    ${off_time}
    ...    @{days}

    Click Device Option    ${name}    Schedule

    Wait For Elements State    text=Save Schedule

    Get Checkbox State    input[type="checkbox"]    ==    Checked

    Get Property    input[type="time"] >> nth=0    value    ==    ${on_time}
    Get Property    input[type="time"] >> nth=1    value    ==    ${off_time}

    FOR    ${day}    IN    @{days}
        Get Attribute    button:has-text("${day}")    aria-pressed    ==    true
    END

    Click    button:has-text("Cancel")

    Wait For Elements State    text=Save Schedule    hidden

Check Device Info
    [Documentation]
    ...    Check device information for given name in the devices table
    [Arguments]
    ...    ${name}
    ...    ${serial}
    ...    ${type}
    ...    ${hw_type}
    ...    ${site}
    ...    ${group}
    ...    ${owner}
    ...    ${ip}
    ...    ${port}

    @{expected_values}    Create List    ${serial}    ${type}    ${hw_type}    ${site}    ${group}    ${owner}    ssh | ${ip}:${port}

    ${rows}=    Get Elements    css=table.MuiTable-root tbody > tr

    ${row_found}=    Set Variable    ${False}

    FOR    ${row}    IN    @{rows}
        ${columns}=    Get Elements    ${row} >> css=td
        ${col_name}=   Get Text        ${columns}[0]

        Log    ${col_name}

        IF    '${col_name}' == '${name}'
            ${row_found}=    Set Variable    ${True}
            FOR    ${i}    IN RANGE    0    7
                ${table_index}=    Evaluate                    ${i} + 1
                ${text}=           Get Text                    ${columns}[${table_index}]
                Should Be Equal    ${expected_values}[${i}]    ${text}
            END
        END
    END

    IF    not ${row_found}
        Fail    Row with name '${name}' not found
    END

Remove All Devices
    [Documentation]
    ...    Removes all devices

    ${rows}=  Get Element Count    css=table.MuiTable-root tbody > tr:has(button)

    WHILE    ${rows} > 0
        ${rows}=       Evaluate        ${rows} - 1

        # Click the button in the last column
        ${button}=    Get Element    css=table.MuiTable-root tbody > tr:has(button):last-child >> td:last-child >> button
        Click         ${button}
        Click         li:has-text("Delete")
        Click         button:has-text("Delete")
        Wait For Elements State    text=Delete Device    hidden
    END

Click Device Option
    [Documentation]
    ...    Clicks the action button on the row where the device name matches.
    [Arguments]
    ...    ${name}
    ...    ${option}

    ${rows}=    Get Elements    css=table.MuiTable-root tbody > tr
    ${row_found}=    Set Variable    ${False}

    FOR    ${row}    IN    @{rows}
        ${columns}=    Get Elements    ${row} >> css=td
        ${col_name}=   Get Text        ${columns}[0]

        IF    '${col_name}' == '${name}'
            # Click the button in the last column
            ${button}=     Get Element    ${columns}[-1] >> css=button
            Click          ${button}
            Click          "${option}"
            ${row_found}=  Set Variable   ${True}
            Exit For Loop
        END
    END

    IF    not ${row_found}
        Fail    Row with name '${name}' not found
    END

Click Device Option by Index
    [Documentation]
    ...    Clicks the action button on the row where the device name matches.
    [Arguments]
    ...    ${index}
    ...    ${option}

    ${row}=     Get Element    css=table.MuiTable-root tbody > tr:nth-child(${index})
    ${button}=  Get Element    ${row} >> css=td:last-child > button
    Click       ${button}
    Click       li:has-text("${option}")


Edit Device
    [Documentation]
    ...    Edit a given device's details
    [Arguments]
    ...    ${name}
    ...    ${newName}=${EMPTY}
    ...    ${newSerial}=${EMPTY}
    ...    ${newType}=${EMPTY}
    ...    ${newHwType}=${EMPTY}
    ...    ${newSite}=${EMPTY}
    ...    ${newGroup}=${EMPTY}
    ...    ${newOwner}=${EMPTY}

    Click Device Option    ${name}    Edit

    Wait For Elements State    input[name="deviceName"]

    IF    "${newName}" != "${EMPTY}"
        Fill Text    input[name="deviceName"]    ${newName}
    END
    IF    "${newSerial}" != "${EMPTY}"
        Fill Text    input[name="deviceSlNo"]    ${newSerial}
    END
    IF    "${newType}" != "${EMPTY}"
        Fill Text    input[name="deviceType"]    ${newType}
    END
    IF    "${newHwType}" != "${EMPTY}"
        Fill Text    input[name="hwType"]    ${newHwType}
    END
    IF    "${newSite}" != "${EMPTY}"
        Fill Text    input[name="site"]    ${newSite}
    END
    IF    "${newGroup}" != "${EMPTY}"
        Fill Text    input[name="group"]    ${newGroup}
    END
    IF    "${newOwner}" != "${EMPTY}"
        Fill Text    input[name="owner"]    ${newOwner}
    END

    Click    button:has-text("Save")

    Wait For Elements State    input[name="deviceName"]    hidden