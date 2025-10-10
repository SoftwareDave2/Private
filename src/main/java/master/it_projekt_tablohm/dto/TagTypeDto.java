package master.it_projekt_tablohm.dto;

public class TagTypeDto {
    private String model;
    private String name; //contains brand
    private int width;
    private int height;

    public String getName(){return name;}
    public void setName(String name){this.name = name;}

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public int getWidth() { return width; }
    public void setWidth(int width) { this.width = width; }

    public int getHeight() { return height; }
    public void setHeight(int height) { this.height = height; }
}
