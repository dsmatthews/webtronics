# How to use ac and transient analysis in webtronics. #

Remember that instead of offering all options as gui options, I prefer to offer
text options that the user can change. The only problem is that you have to learn a little spice. I'm just learning most of it myself.
The manual for gnucap is [HERE](http://www.gnucap.org/dokuwiki/doku.php?id=gnucap:manual).

# Transient analysis #

Transient analysis is voltage over time, sort of like an oscilloscope. Some of the spice models don't work well with gnucap. If you get a convergence error you might try changing voltage source frequency or step time. One setting I found that helps convergence is adding ".options dampstrategy=2" to the netlist in the netlist editor.


1. build this circuit.

![http://3.bp.blogspot.com/-WTngkYR1tlU/Uz7u4pEUzXI/AAAAAAAAASU/QO5umAsdQcQ/s1600/diode.png](http://3.bp.blogspot.com/-WTngkYR1tlU/Uz7u4pEUzXI/AAAAAAAAASU/QO5umAsdQcQ/s1600/diode.png)

2. change the source properties to "SIN(0 12 60HZ)" using the "value or model" drop down menu. This is a sine wave with a 0v offset and 12v peak to peak at 60hz.

3. change the diode properties to "1n4148" using the "value or model" drop down menu AND change the "spice directive" to ".inc models.lib" . The spice directive tells the simulator which file the diode model is in.

4.change the test probe properties to "tran" using the "value or model" menu AND change the "spice directive" to ".TRAN 1ms 100ms" . This spice directive tells the simulator to perform transient analysis in 1 milisecond steps up to 100 miliseconds.

5.Select 10k for the resistor properties in "value or model".

6.click the run spice button.


First Gnucap will download. Then the simulation will begin. If the simulation is short you can check the log for errors.The log may take a long time to load if there are many steps.If the simulation is taking too long you can cancel it. If the simulation doesn't work check the netlist.

Webtronics is unfinished and may have  gotten the netlist wrong. If you want to, you can open the netlist and edit it and click the run button.The changes to the netlist are not saved in the circuit.




# AC analysis #

Here is how to use AC analysis in Webtronics.

1. build this circuit

![http://4.bp.blogspot.com/-9Rv1iGLViyE/U0cmJ04XTBI/AAAAAAAAASo/YCDS5vyh8xw/s1600/ac.png](http://4.bp.blogspot.com/-9Rv1iGLViyE/U0cmJ04XTBI/AAAAAAAAASo/YCDS5vyh8xw/s1600/ac.png)

2. For the ac source select "AC 1 SIN" from the "value or model" menu and select ".ac lin 20 100 200 " from the "spice directive" menu. This is 20 steps starting at 100hz and ending at 200 hz. Add  i(v1)  to the "measurements" field to measure the current of voltage source v1.

3. The rest of the values are marked in the image.

4.Click the run spice button.

The waveform is shown in the graph display. Only one simulation type can be run at a time. This is useful for calculating operating frequencies for circuits. Enjoy.