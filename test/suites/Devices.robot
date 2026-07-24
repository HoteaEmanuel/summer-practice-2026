*** Settings ***
Resource  ../resources/keywords.robot
Resource  ../resources/variables.robot

Suite Setup    Load Project and Login

Test Setup    Run Keywords     
...    Go To Page    Devices    AND
...    Remove All Devices

*** Test Cases ***
Add New Device:
    Add New Device     AirScale BTS 1    SN-001    Base Station    Nokia AirScale    TIM Test Lab    Group A    John Doe    20    10.0.0.1    22
    Check Device Info  AirScale BTS 1    SN-001    Base Station    Nokia AirScale    TIM Test Lab    Group A    John Doe    10.0.0.1    22

Edit Device:
    Add New Device     AirScale BTS 1    SN-001    Base Station    Nokia AirScale    TIM Test Lab    Group A    John Doe    20    10.0.0.1    22
    Edit Device        AirScale BTS 1    AirScale BTS 2
    Check Device Info  AirScale BTS 2    SN-001    Base Station    Nokia AirScale    TIM Test Lab    Group A    John Doe    10.0.0.1    22

Remove Device:
    Add New Device        AirScale BTS 1    SN-001    Base Station    Nokia AirScale    TIM Test Lab    Group A    John Doe    20    10.0.0.1    22
    Click Device Option    AirScale BTS 1    Delete
    Click                  button:has-text("Delete")
    Wait For Elements State    text=Delete Device    hidden
    Run Keyword And Expect Error    *
    ...    Check Device Info  AirScale BTS 1    SN-001    Base Station    Nokia AirScale    TIM Test Lab    Group A    John Doe    10.0.0.1    22

Add Schedule:
    Add New Device        AirScale BTS 1    SN-001    Base Station    Nokia AirScale    TIM Test Lab    Group A    John Doe    20    10.0.0.1    22
    Add Schedule           AirScale BTS 1    09:00    18:00    Mon    Tue    Wed    Thu    Fri
    Check Device Schedule  AirScale BTS 1    09:00    18:00    Mon    Tue    Wed    Thu    Fri