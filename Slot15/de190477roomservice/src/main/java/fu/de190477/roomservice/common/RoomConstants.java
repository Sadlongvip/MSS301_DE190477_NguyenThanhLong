package fu.de190477.roomservice.common;

public final class RoomConstants {

    private RoomConstants() {
    }

    public static final String ROOM_TYPE_SINGLE = "SINGLE";
    public static final String ROOM_TYPE_DOUBLE = "DOUBLE";
    public static final String ROOM_TYPE_SUITE = "SUITE";
    public static final String ROOM_TYPE_DELUXE = "DELUXE";

    public static final String STATUS_AVAILABLE = "AVAILABLE";
    public static final String STATUS_OCCUPIED = "OCCUPIED";
    public static final String STATUS_MAINTAINANCE = "MAINTAINANCE";

    public static final String ROOM_TYPE_REGEX = "SINGLE|DOUBLE|SUITE|DELUXE";
    public static final String STATUS_REGEX = "AVAILABLE|OCCUPIED|MAINTAINANCE";
}
